"""Read-only rendered-HTML smoke checks. Run against a production build or live site."""
import sys, urllib.request, urllib.error, re, json
from html.parser import HTMLParser
from html import unescape
from urllib.parse import urlsplit
from concurrent.futures import ThreadPoolExecutor
BASE = (sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:3100').rstrip('/')
LOCALES = ['', 'hi','bn','ta','te','mr','kn','gu','ml','pa','or']
class Page(HTMLParser):
 def __init__(self, html):
  super().__init__(); self.tags=[]; self.schema=[]; self.ld=False; self.data=''; self.feed(html)
 def handle_starttag(self, tag, attrs):
  a=dict(attrs);self.tags.append((tag,a))
  if tag=='script' and a.get('type')=='application/ld+json':self.ld=True;self.data=''
 def handle_data(self,data):
  if self.ld:self.data+=data
 def handle_endtag(self,tag):
  if tag=='script' and self.ld:self.schema.append(json.loads(self.data));self.ld=False
 def find(self,tag):return [a for t,a in self.tags if t==tag]
def get(path):
 with urllib.request.urlopen(BASE+path,timeout=25) as r:return r.status,r.url,r.read().decode()
def check(locale):
 prefix='/'+locale if locale else ''
 _,_,html=get(prefix or '/');p=Page(html)
 assert len(p.find('h1'))==1,(prefix,'h1')
 assert len(p.find('main'))==1,(prefix,'main')
 assert not any(a.get('role')=='menu' for _,a in p.tags),(prefix,'menu semantics')
 assert not any('clerk' in a.get('src','') for a in p.find('script')),(prefix,'public auth bundle')
 assert not any('fonts.googleapis' in a.get('href','') for a in p.find('link')),(prefix,'blocking font CSS')
 hero=re.search(r'<div class="hero-actions"[^>]*>(.*?)</div>',html,re.S).group(1)
 assert 'play.google.com/store/apps/details?id=com.samaan.bol' in hero,(prefix,'Play CTA')
 assert 'apps.apple.com/in/app/samaan-bol/id6759739444' in hero,(prefix,'Apple CTA')
 assert all(not re.match(r'/[^/]+/refund-policy',a.get('href','')) for a in p.find('a')),(prefix,'refund links')
 schemas=[x for block in p.schema for x in (block if isinstance(block,list) else [block])]
 faqs=[x for x in schemas if x.get('@type')=='FAQPage']
 assert len(faqs)==1,(prefix,'one FAQ schema')
 faq=faqs[0]
 assert len(faq['mainEntity'])==7,(prefix,'seven FAQ topics')
 assert all(q['name'] in html and q['acceptedAnswer']['text'] in html for q in faq['mainEntity']),(prefix,'schema visibility')
 apps=[x for x in schemas if 'SoftwareApplication' in x.get('@type',[])]
 assert len(apps)==1 and set(apps[0]['@type'])=={'SoftwareApplication','MobileApplication','WebApplication'},(prefix,'combined app schema')
 assert not {'pa-IN','or-IN'}.intersection(apps[0]['inLanguage']),(prefix,'voice scope')
 links=p.find('link')
 canon=[a['href'] for a in links if a.get('rel')=='canonical']
 assert len(canon)==1 and urlsplit(canon[0]).path.rstrip('/')==prefix,(prefix,'canonical')
 languages={a['hreflang']:a['href'] for a in links if a.get('rel')=='alternate' and 'hreflang' in a}
 assert len(languages)==12,(prefix,'all hreflang alternates')
 for code in LOCALES:
  key=(code or 'en')+'-IN'
  assert urlsplit(languages[key]).path.rstrip('/')==('/'+code if code else ''),(prefix,key)
 assert urlsplit(languages['x-default']).path.rstrip('/')=='',(prefix,'x-default')
 for suffix in ['/pricing','/billing-on-a-laptop','/udhaar']:
  status,_,body=get(prefix+suffix);assert status==200
  assert 'play.google.com/store/apps/details?id=com.samaan.bol' in body,(prefix+suffix,'Play path')
  related=Page(body)
  canonical=[a['href'] for a in related.find('link') if a.get('rel')=='canonical']
  assert len(canonical)==1 and urlsplit(canonical[0]).path==prefix+suffix,(prefix+suffix,'canonical')
  alternates={a['hreflang']:a['href'] for a in related.find('link') if a.get('rel')=='alternate' and 'hreflang' in a}
  assert len(alternates)==12,(prefix+suffix,'hreflang count')
  for code in LOCALES:
   assert urlsplit(alternates[(code or 'en')+'-IN']).path==('/'+code if code else '')+suffix,(prefix+suffix,'hreflang target')
  if suffix=='/pricing':
   blocks=[x for block in related.schema for x in (block if isinstance(block,list) else [block])]
   offer=next(x for x in blocks if x.get('@type')=='SoftwareApplication')
   assert [x['price'] for x in offer['offers']]==['499','3999'],(prefix,'Premium prices')
   faq=next(x for x in blocks if x.get('@type')=='FAQPage')
   assert all(q['name'] in unescape(body) and q['acceptedAnswer']['text'] in unescape(body) for q in faq['mainEntity']),(prefix,'pricing FAQ parity')
   assert all('Samaan-Bol' not in q['name']+q['acceptedAnswer']['text'] for q in faq['mainEntity']),(prefix,'pricing FAQ branding')
 if locale:
  status,url,_=get(prefix+'/refund-policy');assert status==200 and url.endswith('/refund-policy') and not url.endswith(prefix+'/refund-policy'),(prefix,'legacy redirect')
 return prefix or '/'
with ThreadPoolExecutor(max_workers=4) as pool:
 for path in pool.map(check,LOCALES):print('PASS',path)
for route in ([] if '--public-only' in sys.argv else ['/account','/hi/account','/shop','/subscription/return']):
 _,_,html=get(route);p=Page(html)
 assert any('clerk' in a.get('src','') for a in p.find('script')),(route,'missing auth provider')
 assert any(a.get('src','').startswith('https://clerk.samaanbol.space/') for a in p.find('script')),(route,'invalid Clerk script host; check build environment')
 assert any(a.get('name')=='robots' and 'noindex' in a.get('content','') for a in p.find('meta')),(route,'noindex')
 print('PASS auth metadata',route)
_,_,guide=get('/guides/voice-billing-for-kirana')
g=Page(guide)
assert len(g.find('h1'))==1 and len(g.find('main'))==1
assert any(x.get('@type')=='Article' for b in g.schema for x in (b if isinstance(b,list) else [b]))
assert 'play.google.com/store/apps/details?id=com.samaan.bol' in guide
assert '/guides/voice-billing-for-kirana' in get('/sitemap.xml')[2]
assert any(a.get('lang')=='hi-IN' for t,a in g.tags if t=='section'), 'Hindi guide steps'
assert 'selected the product manually' in guide, 'Manual capture disclosure'
assert get('/llms.txt')[0]==200
print('PASS guide, Hindi steps, manual capture disclosure, llms.txt and sitemap')
print('Public routes, store links, refund redirects, canonical/hreflang, pricing and schema visibility passed.')
if '--public-only' in sys.argv: print('Authenticated-route checks skipped (--public-only); browser behavior still requires QA.')
