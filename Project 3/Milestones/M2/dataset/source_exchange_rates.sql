create table if not exists source.exchange_rates  (
  src     string
)
PARTITION BY DATE(_PARTITIONTIME)
;

INSERT source.exchange_rates (src)
VALUES (
  '{"disclaimer": "Usage subject to terms: https://openexchangerates.org/terms", "license": "https://openexchangerates.org/license", "timestamp": 1604718017, "base": "USD", "rates": {"AED": 3.673, "AFN": 76.899997, "ALL": 104.2, "AMD": 481.616228, "ANG": 1.794205, "AOA": 665.11, "ARS": 79.037671, "AUD": 1.37779, "AWG": 1.8, "AZN": 1.7025, "BAM": 1.656038, "BBD": 2, "BDT": 84.70399, "BGN": 1.647444, "BHD": 0.377031, "BIF": 1940, "BMD": 1, "BND": 1.35351, "BOB": 6.892152, "BRL": 5.3648, "BSD": 1, "BTC": 6.4085476e-05, "BTN": 74.100337, "BWP": 11.247714, "BYN": 2.61912, "BZD": 2.014845, "CAD": 1.306201, "CDF": 1966, "CHF": 0.900247, "CLF": 0.027235, "CLP": 751.498904, "CNH": 6.601, "CNY": 6.6114, "COP": 3755.072631, "CRC": 611.186197, "CUC": 0.999773, "CUP": 25.75, "CVE": 93.525, "CZK": 22.37795, "DJF": 178.05, "DKK": 6.27577, "DOP": 58.45, "DZD": 128.996566, "EGP": 15.68928, "ERN": 15.000416, "ETB": 37.6, "EUR": 0.842151, "FJD": 2.1435, "FKP": 0.760023, "GBP": 0.760023, "GEL": 3.37, "GGP": 0.760023, "GHS": 5.83, "GIP": 0.760023, "GMD": 51.7875, "GNF": 9760, "GTQ": 7.781733, "GYD": 209.021699, "HKD": 7.7536, "HNL": 24.5505, "HRK": 6.366095, "HTG": 63.347578, "HUF": 302.108, "IDR": 14214.837, "ILS": 3.37496, "IMP": 0.760023, "INR": 73.98115, "IQD": 1190.5, "IRR": 42105, "ISK": 137.69, "JEP": 0.760023, "JMD": 146.93799, "JOD": 0.709, "JPY": 103.36702745, "KES": 109.050171, "KGS": 82.8082, "KHR": 4070, "KMF": 414.399971, "KPW": 900, "KRW": 1121.898663, "KWD": 0.30544, "KYD": 0.832976, "KZT": 432.294249, "LAK": 9275, "LBP": 1513.246905, "LKR": 184.398077, "LRD": 176.499989, "LSL": 15.8, "LYD": 1.37, "MAD": 9.12, "MDL": 17.116052, "MGA": 3900, "MKD": 51.947669, "MMK": 1287.464876, "MNT": 2843.736939, "MOP": 7.982293, "MRO": 357, "MRU": 37.16, "MUR": 39.951661, "MVR": 15.4, "MWK": 760, "MXN": 20.601151, "MYR": 4.1285, "MZN": 73.1, "NAD": 15.8, "NGN": 382, "NIO": 34.835224, "NOK": 9.16327, "NPR": 118.561614, "NZD": 1.477203, "OMR": 0.384989, "PAB": 1, "PEN": 3.592, "PGK": 3.505, "PHP": 48.178643, "PKR": 159.15, "PLN": 3.79109, "PYG": 7023.670936, "QAR": 3.641, "RON": 4.099, "RSD": 99.02, "RUB": 77.4317, "RWF": 982.5, "SAR": 3.750464, "SBD": 8.101947, "SCR": 19.839401, "SDG": 55.3, "SEK": 8.642515, "SGD": 1.348505, "SHP": 0.760023, "SLL": 9993.999938, "SOS": 582.5, "SRD": 14.154, "SSP": 130.26, "STD": 21040.953008, "STN": 21.05, "SVC": 8.745414, "SYP": 513.016884, "SZL": 15.8, "THB": 30.559051, "TJS": 11.322298, "TMT": 3.5, "TND": 2.7375, "TOP": 2.303174, "TRY": 8.525, "TTD": 6.783812, "TWD": 28.5815, "TZS": 2318.017, "UAH": 28.24013, "UGX": 3739.888605, "USD": 1, "UYU": 42.750083, "UZS": 10366, "VEF": 248487.642241, "VES": 517886.857513, "VND": 23182.52148, "VUV": 113.119273, "WST": 2.610639, "XAF": 552.415073, "XAG": 0.03905491, "XAU": 0.00051244, "XCD": 2.70255, "XDR": 0.704284, "XOF": 552.415073, "XPD": 0.00040063, "XPF": 100.495388, "XPT": 0.00111733, "YER": 250.349961, "ZAR": 15.58855, "ZMW": 20.616101, "ZWL": 322}}'
)
;