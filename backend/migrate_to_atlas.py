"""Copy local EventHub MongoDB data to Atlas. Usage: set ATLAS_URL env var, then run."""
import os
from pymongo import MongoClient

src = MongoClient("mongodb://localhost:27017")
dst = MongoClient(os.environ["ATLAS_URL"], serverSelectionTimeoutMS=15000)

for db in ("eventhub_db", "eventhub"):
    for col in src[db].list_collection_names():
        docs = list(src[db][col].find())
        if docs:
            dst[db][col].delete_many({})
            dst[db][col].insert_many(docs)
        print(f"{db}.{col}: {len(docs)} copied")
