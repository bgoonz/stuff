import numpy as np
import pandas as pd

if __name__ == "__main__":
    series = pd.Series([1, 3, 5, np.nan, 6, 8])
    print(series)
