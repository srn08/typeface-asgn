import pandas as pd
from sqlalchemy import create_engine

df = pd.read_csv("zomato.csv")
df.rename(columns=lambda x: x.strip().replace(" ", "_").lower(), inplace=True)

engine = create_engine("sqlite:///zomato.db")
df.to_sql("restaurants", con=engine, if_exists="replace", index=False)