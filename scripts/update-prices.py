import json, re, urllib.request
from datetime import datetime, timezone
from pathlib import Path

PATH=Path('knowledge/pricing.json')
UA='27sys-price-monitor/1.0 (+https://www.27sys.ma)'


def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml'})
    with urllib.request.urlopen(req,timeout=25) as r:
        return r.read().decode('utf-8','ignore')


def parse_price(html):
    patterns=[
        r'(?is)meilleure offre actuelle.{0,900}?([0-9][0-9\s\u00a0.,]{1,14})\s*(?:DH|Dhs|MAD)',
        r'(?is)"price"\s*:\s*"?([0-9][0-9\s\u00a0.,]{1,14})',
        r'(?is)itemprop=["\']price["\'][^>]*content=["\']([0-9][0-9.,\s\u00a0]*)'
    ]
    for pattern in patterns:
        m=re.search(pattern,html)
        if not m: continue
        raw=m.group(1).replace('\u00a0','').replace(' ','').replace(',','.').strip()
        try:
            value=float(raw)
            if 20 <= value <= 100000:
                return int(round(value))
        except ValueError:
            pass
    return None


def main():
    data=json.loads(PATH.read_text(encoding='utf-8'))
    checked=datetime.now(timezone.utc).astimezone().strftime('%Y-%m-%d')
    changed=False
    for product in data['products']:
        if not product.get('auto_update'): continue
        product['last_checked']=checked
        try:
            html=fetch(product['url'])
            price=parse_price(html)
            if price:
                if price != product.get('price'):
                    product['previous_price']=product.get('price')
                    product['price']=price
                    changed=True
                product['price_status']='live'
            else:
                product['price_status']='fallback'
        except Exception as exc:
            product['price_status']='fallback'
            product['last_error']=type(exc).__name__
    data['meta']['updated_at']=checked
    data['meta']['update_mode']='automatique quotidien par GitHub Actions'
    PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding='utf-8')
    print(f'Price feed checked: {checked}; changed={changed}')

if __name__=='__main__': main()
