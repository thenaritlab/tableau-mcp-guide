"""
vds_direct_query.py — ยิง VizQL Data Service ตรง (ไม่ผ่าน AI)
ใช้กับ: บท 5.5 (deterministic plumbing) + บท 5.6 (debug query ของ AI)

เตรียม: pip install requests
env:    TABLEAU_SERVER, TABLEAU_SITE, TABLEAU_PAT_NAME, TABLEAU_PAT_SECRET
"""
import os
import sys
import requests

SERVER = os.environ["TABLEAU_SERVER"]          # https://xxx.online.tableau.com
SITE = os.environ.get("TABLEAU_SITE", "")      # content URL ("" = Server default site)
PAT_NAME = os.environ["TABLEAU_PAT_NAME"]
PAT_SECRET = os.environ["TABLEAU_PAT_SECRET"]
API_VER = "3.24"


def sign_in() -> str:
    """แลก PAT เป็น session token (X-Tableau-Auth) — ดูบท 2.6"""
    r = requests.post(
        f"{SERVER}/api/{API_VER}/auth/signin",
        json={
            "credentials": {
                "personalAccessTokenName": PAT_NAME,
                "personalAccessTokenSecret": PAT_SECRET,
                "site": {"contentUrl": SITE},
            }
        },
        headers={"Accept": "application/json"},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["credentials"]["token"]


def vds_query(token: str, datasource_luid: str, query: dict) -> dict:
    """ยิง query-datasource ของ VDS — โครง query ดูบท 5.6"""
    r = requests.post(
        f"{SERVER}/api/v1/vizql-data-service/query-datasource",
        json={"datasource": {"datasourceLuid": datasource_luid}, "query": query},
        headers={"X-Tableau-Auth": token, "Accept": "application/json"},
        timeout=120,
    )
    r.raise_for_status()
    return r.json()


if __name__ == "__main__":
    # ตัวอย่าง: Top 5 states by SUM(Sales) — แก้ LUID + fieldCaption เป็นของคุณ
    DATASOURCE_LUID = sys.argv[1] if len(sys.argv) > 1 else "YOUR-DATASOURCE-LUID"

    query = {
        "fields": [
            {"fieldCaption": "State"},
            {"fieldCaption": "Sales", "function": "SUM",
             "sortDirection": "DESC", "sortPriority": 1},
        ],
        "filters": [
            {
                "field": {"fieldCaption": "State"},
                "filterType": "TOP",
                "howMany": 5,
                "direction": "TOP",
                "fieldToMeasure": {"fieldCaption": "Sales", "function": "SUM"},
            }
        ],
    }

    token = sign_in()
    result = vds_query(token, DATASOURCE_LUID, query)

    for row in result.get("data", []):
        print(row)
