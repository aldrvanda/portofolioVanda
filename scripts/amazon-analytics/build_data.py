"""Hitung ulang hasil analisis Amazon Sale Report (versi notebook yang sudah diperbaiki)
dan simpan ringkasannya ke lib/amazon-analytics.json untuk halaman /amazon-sales.

Pakai:
    python scripts/amazon-analytics/build_data.py "path/ke/Amazon Sale Report.csv"

Logika pembersihan, uji statistik, dan model mengikuti DataAnalytics_FIXED.ipynb.
TUNED_PARAMS diambil dari hasil RandomizedSearchCV + GridSearchCV di notebook tersebut
(pencarian tidak diulang di sini karena memakan beberapa menit).
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import scipy.stats as stats
import statsmodels.api as sm
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder

TUNED_PARAMS = {
    "bootstrap": False,
    "max_depth": 10,
    "max_features": 0.5,
    "min_samples_leaf": 1,
    "min_samples_split": 2,
    "n_estimators": 100,
}
SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL", "Free"]
OUT = Path(__file__).resolve().parents[2] / "lib" / "amazon-analytics.json"


def r(x, n=2):
    return None if x is None or (isinstance(x, float) and np.isnan(x)) else round(float(x), n)


def main(csv_path):
    raw = pd.read_csv(csv_path, low_memory=False)
    out = {"raw_rows": len(raw)}

    # ── Cleaning ────────────────────────────────────────────────────────────
    dup = raw.drop(columns=["index"]).duplicated()
    df = raw[~dup].copy()
    out["duplicates"] = int(dup.sum())

    df["Date"] = pd.to_datetime(df["Date"], format="%m-%d-%y", errors="coerce")
    df["Month"] = df["Date"].dt.month_name()
    df["MonthNum"] = df["Date"].dt.month
    out["date_min"] = str(df["Date"].min().date())
    out["date_max"] = str(df["Date"].max().date())
    out["march_rows"] = int((df["MonthNum"] == 3).sum())

    status_cond = df["Status"].isin([
        "Cancelled", "Shipped - Lost in Transit", "Shipped - Rejected by Buyer",
        "Shipped - Returned to Seller", "Shipped - Returning to Seller",
    ])
    courier_cond = (df["Courier Status"] == "Cancelled") | df["Courier Status"].isna()
    unshipped_cond = df["Status"].isin(["Shipped", "Shipping"]) & (df["Courier Status"] == "Unshipped")
    failed = status_cond | courier_cond | unshipped_cond
    df["Failed"] = failed.astype(int)
    out["failed_rows"] = int(failed.sum())
    out["failed_rate"] = r(failed.mean() * 100)

    fail_cat = df.groupby("Category")["Failed"].agg(["mean", "count"]).sort_values("mean", ascending=False)
    out["failed_by_category"] = [
        {"category": k, "rate": r(v["mean"] * 100), "orders": int(v["count"])} for k, v in fail_cat.iterrows()
    ]
    fail_ful = df.groupby("Fulfilment")["Failed"].agg(["mean", "count"])
    out["failed_by_fulfilment"] = [
        {"fulfilment": k, "rate": r(v["mean"] * 100), "orders": int(v["count"])} for k, v in fail_ful.iterrows()
    ]

    m = df[~failed].copy()
    m = m.drop(columns=["index", "Order ID", "Unnamed: 22", "ship-postal-code", "SKU", "ASIN", "Style", "currency"])

    promo_types = (m["promotion-ids"].dropna().str.split(",").explode()
                   .str.replace(r"AAT-.*|#MP-.*|SS-.*", "", regex=True).str.strip())
    pt = promo_types.value_counts()
    out["promo_tag_total"] = int(pt.sum())
    out["promo_tags_top"] = [{"name": k, "count": int(v)} for k, v in pt.head(3).items()]
    out["fulfilled_by_redundant"] = bool(
        (pd.crosstab(m["Fulfilment"], m["fulfilled-by"].fillna("NA")).gt(0).sum(axis=1) == 1).all()
    )
    m["Promo"] = (m["promotion-ids"].notna() & (m["promotion-ids"] != "")).astype(int)
    m = m.drop(columns=["promotion-ids", "fulfilled-by"])
    for col in ["ship-city", "ship-state", "ship-country"]:
        m[col] = m[col].fillna("unknown").str.upper()
    m = m.dropna(subset=["Amount", "Courier Status"])
    m = m[m["Amount"] > 0]
    out["clean_rows"] = len(m)

    # ── KPI ─────────────────────────────────────────────────────────────────
    out["revenue"] = r(m["Amount"].sum(), 0)
    out["units"] = int(m["Qty"].sum())
    out["amount_median"] = r(m["Amount"].median(), 0)
    out["amount_mean"] = r(m["Amount"].mean(), 0)
    out["amount_min"] = r(m["Amount"].min(), 0)
    out["amount_max"] = r(m["Amount"].max(), 0)
    out["amount_skew"] = r(m["Amount"].skew())
    out["qty1_share"] = r((m["Qty"] == 1).mean() * 100)

    edges = np.arange(0, 2600, 100)
    hist, _ = np.histogram(m["Amount"].clip(upper=2499.99), bins=edges)
    out["amount_hist"] = [{"from": int(a), "to": int(a + 100), "count": int(c)} for a, c in zip(edges[:-1], hist)]

    cat = m.groupby("Category").agg(units=("Qty", "sum"), orders=("Amount", "count"),
                                    revenue=("Amount", "sum"), median=("Amount", "median"))
    cat = cat.sort_values("revenue", ascending=False)
    out["categories"] = [
        {"category": k, "units": int(v.units), "orders": int(v.orders), "revenue": r(v.revenue, 0), "median": r(v["median"], 0)}
        for k, v in cat.iterrows()
    ]

    size = m.groupby("Size")["Qty"].sum().reindex([s for s in SIZE_ORDER if s in m["Size"].unique()])
    out["sizes"] = [{"size": k, "units": int(v)} for k, v in size.items()]

    pivot = m.pivot_table(index="Category", columns="Size", values="Amount", aggfunc="median")
    pivot = pivot.reindex(columns=[s for s in SIZE_ORDER if s in pivot.columns], index=cat.index)
    out["heatmap"] = {
        "sizes": list(pivot.columns),
        "rows": [{"category": k, "values": [r(v, 0) for v in row.values]} for k, row in pivot.iterrows()],
    }

    top3 = m["Category"].value_counts().nlargest(3).index
    am = m[m["MonthNum"] != 3]
    out["monthly"] = [
        {"month": mn, "values": {c: int(am[(am["Month"] == mn) & (am["Category"] == c)]["Qty"].sum()) for c in top3}}
        for mn in ["April", "May", "June"]
    ]
    out["monthly_categories"] = list(top3)
    # Minggu penuh saja (Senin 4 Apr – Minggu 26 Jun); minggu pertama & terakhir hanya 3 hari.
    full = m[(m["Date"] >= "2022-04-04") & (m["Date"] <= "2022-06-26")]
    wk = full.set_index("Date").resample("W-SUN")["Amount"].sum()
    out["weekly_revenue"] = [
        {"week": str((k - pd.Timedelta(days=6)).date()), "revenue": r(v, 0)} for k, v in wk.items()
    ]

    st = m.groupby("ship-state")["Amount"].sum().sort_values(ascending=False)
    out["top_states"] = [{"state": k.title(), "revenue": r(v, 0)} for k, v in st.head(8).items()]
    out["state_top5_share"] = r(st.head(5).sum() / st.sum() * 100)

    # ── B2B & Promo ─────────────────────────────────────────────────────────
    seg = m.assign(Segment=np.where(m["B2B"], "B2B", "B2C"))
    out["b2b_units_share"] = r(seg[seg.Segment == "B2B"]["Qty"].sum() / seg["Qty"].sum() * 100)
    out["segment_promo"] = [
        {"segment": s, "promo_share": r(g["Promo"].mean() * 100), "orders": len(g),
         "median_promo": r(g[g.Promo == 1]["Amount"].median(), 0), "median_nopromo": r(g[g.Promo == 0]["Amount"].median(), 0)}
        for s, g in seg.groupby("Segment")
    ]
    out["promo_by_fulfilment"] = [
        {"fulfilment": k, "promo_share": r(v * 100)} for k, v in m.groupby("Fulfilment")["Promo"].mean().items()
    ]

    # ── Uji hipotesis ───────────────────────────────────────────────────────
    A = m[m.Promo == 0]
    B = m[m.Promo == 1]
    rng = np.random.default_rng(42)
    n = min(5000, len(A), len(B))
    wA, pA = stats.shapiro(rng.choice(A["Amount"].values, n, replace=False))
    wB, pB = stats.shapiro(rng.choice(B["Amount"].values, n, replace=False))

    groups = [g["Amount"].values for _, g in m.groupby("Category")]
    f_stat, p_anova = stats.f_oneway(*groups)
    _, p_lev = stats.levene(*groups)
    h_stat, p_kw = stats.kruskal(*groups)
    gm = m["Amount"].mean()
    eta = sum(len(g) * (g.mean() - gm) ** 2 for g in groups) / ((m["Amount"] - gm) ** 2).sum()

    ct = pd.crosstab(np.where(m["B2B"], "B2B", "B2C"), m["Promo"])
    chi2, p_chi, dof, _ = stats.chi2_contingency(ct)
    cv = np.sqrt(chi2 / (ct.values.sum() * (min(ct.shape) - 1)))

    def cohen_d(x, y):
        nx, ny = len(x), len(y)
        sp = np.sqrt(((nx - 1) * x.std(ddof=1) ** 2 + (ny - 1) * y.std(ddof=1) ** 2) / (nx + ny - 2))
        return (x.mean() - y.mean()) / sp

    ab = {}
    for col in ["Amount", "Qty"]:
        _, p_t = stats.ttest_ind(A[col], B[col], equal_var=False)
        _, p_u = stats.mannwhitneyu(A[col], B[col], alternative="two-sided")
        ab[col] = {"mean_a": r(A[col].mean(), 4), "mean_b": r(B[col].mean(), 4), "p_t": float(p_t),
                   "p_mwu": float(p_u), "d": r(cohen_d(B[col], A[col]), 4)}

    strata = m.groupby(["Fulfilment", "Category", "Promo"])["Amount"].agg(["mean", "count"]).unstack("Promo").dropna()
    strata = strata[(strata[("count", 0)] >= 30) & (strata[("count", 1)] >= 30)]
    diff = strata[("mean", 1)] - strata[("mean", 0)]
    w = strata[("count", 0)] + strata[("count", 1)]
    ab["adjusted_diff"] = r(np.average(diff, weights=w))
    ab["raw_diff"] = r(B["Amount"].mean() - A["Amount"].mean())
    ab["n_a"], ab["n_b"] = len(A), len(B)
    ab["strata"] = [{"fulfilment": f, "category": c, "diff": r(v, 1), "n": int(w[(f, c)])} for (f, c), v in diff.sort_values().items()]
    out["ab"] = ab

    out["tests"] = {
        "shapiro": {"w_a": r(wA, 4), "p_a": float(pA), "w_b": r(wB, 4), "p_b": float(pB)},
        "anova": {"f": r(f_stat), "p": float(p_anova), "p_levene": float(p_lev), "h": r(h_stat), "p_kruskal": float(p_kw), "eta_sq": r(eta, 4)},
        "chi2": {"chi2": r(chi2, 4), "dof": int(dof), "p": float(p_chi), "cramers_v": r(cv, 4),
                 "table": {seg_: {"promo": int(ct.loc[seg_, 1]), "no_promo": int(ct.loc[seg_, 0])} for seg_ in ct.index}},
    }

    # ── OLS ─────────────────────────────────────────────────────────────────
    cat_cols = ["Fulfilment", "Sales Channel ", "ship-service-level", "Category", "Size", "Month"]
    o = m.copy()
    o["B2B"] = o["B2B"].astype(int)
    X = pd.concat([pd.get_dummies(o[cat_cols], drop_first=True), o[["Qty", "B2B", "Promo"]]], axis=1).astype(float)
    X = sm.add_constant(X)
    ols = sm.OLS(o["Amount"], X).fit()
    out["ols"] = {
        "r2": r(ols.rsquared, 4), "adj_r2": r(ols.rsquared_adj, 4), "cond": r(np.linalg.cond(X.values), 0),
        "coefs": [{"feature": k, "coef": r(ols.params[k]), "p": float(ols.pvalues[k])} for k in ols.params.index if k != "const"],
    }

    # ── Random Forest ───────────────────────────────────────────────────────
    feats = ["Fulfilment", "Sales Channel ", "ship-service-level", "Category", "Size", "Qty", "B2B", "MonthNum", "Promo"]
    x = m[feats].copy()
    x["B2B"] = x["B2B"].astype(int)
    x["Size"] = x["Size"].map({s: i for i, s in enumerate(SIZE_ORDER)}).fillna(len(SIZE_ORDER))
    x["ship-service-level"] = x["ship-service-level"].map({"Standard": 0, "Expedited": 1}).fillna(0)
    x["Month_sin"] = np.sin(2 * np.pi * x["MonthNum"] / 12)
    x["Month_cos"] = np.cos(2 * np.pi * x["MonthNum"] / 12)
    x = x.drop(columns=["MonthNum"])
    for col in ["Category", "Fulfilment", "Sales Channel "]:
        x[col] = LabelEncoder().fit_transform(x[col].astype(str))
    y = m["Amount"]
    x_tr, x_te, y_tr, y_te = train_test_split(x, y, test_size=0.2, random_state=42)
    out["train_rows"], out["test_rows"] = len(x_tr), len(x_te)
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    def evaluate(model):
        model.fit(x_tr, y_tr)
        p = model.predict(x_te)
        cvs = cross_val_score(model, x_tr, y_tr, cv=kf, scoring="r2", n_jobs=-1)
        return {
            "r2": r(r2_score(y_te, p), 4), "mae": r(mean_absolute_error(y_te, p)),
            "rmse": r(np.sqrt(mean_squared_error(y_te, p))), "mape": r(np.mean(np.abs((y_te - p) / y_te)) * 100),
            "cv": [r(s, 4) for s in cvs], "cv_mean": r(cvs.mean(), 4), "cv_std": r(cvs.std(), 4),
            "importance": sorted(
                [{"feature": f.strip(), "value": r(v, 4)} for f, v in zip(x.columns, model.feature_importances_)],
                key=lambda d: -d["value"],
            ),
        }

    out["rf_baseline"] = evaluate(RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
    out["rf_tuned"] = evaluate(RandomForestRegressor(random_state=42, n_jobs=-1, **TUNED_PARAMS))
    out["rf_tuned"]["params"] = TUNED_PARAMS

    OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False), encoding="utf-8")
    print("written", OUT)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
