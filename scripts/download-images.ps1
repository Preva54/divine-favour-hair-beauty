$ErrorActionPreference = "Continue"
$base = "C:\Users\meetp\OneDrive\Desktop\Divine Favour Hair & Beauty\public\images"
New-Item -ItemType Directory -Force -Path $base | Out-Null

$u = "https://images.unsplash.com/{0}?auto=format&fit=crop&w={1}&q=80"
$p = "https://images.pexels.com/photos/{0}/pexels-photo-{0}.jpeg?auto=compress&cs=tinysrgb&w={1}"

$map = [ordered]@{
  "hero-salon.jpg"    = @(($u -f "photo-1522337660859-02fbefca4702",1920), ($p -f 3993449,1920), ($p -f 3992877,1920))
  "hero-model.jpg"    = @(($u -f "photo-1524504388940-b1c1722653e1",1600), ($u -f "photo-1529626455594-4ff0802cfb7e",1600))
  "about-salon.jpg"   = @(($u -f "photo-1560066984-138dadb4c035",1600), ($p -f 3993322,1600), ($p -f 3762874,1600))
  "cta-bg.jpg"        = @(($u -f "photo-1526758097130-bab247274f58",1920), ($u -f "photo-1521590832167-7bcbfaa6381f",1920))
  "bridal-1.jpg"      = @(($u -f "photo-1519741497674-611481863552",1600), ($p -f 1620657,1600))
  "salon-team.jpg"    = @(($u -f "photo-1522335789203-aabd1fc54bc9",1600), ($p -f 3993310,1600))
  "hair-1.jpg"        = @(($u -f "photo-1562322140-8baeececf3df",1200), ($u -f "photo-1580618672591-eb180b1a973f",1200))
  "hair-2.jpg"        = @(($u -f "photo-1605497788044-5a32c7078486",1200), ($u -f "photo-1616683693504-3ea7e9ad6fec",1200))
  "hair-3.jpg"        = @(($u -f "photo-1595476108010-b4d1f102b1b1",1200), ($u -f "photo-1580618837931-7d9e9f1a5e9d",1200))
  "hair-4.jpg"        = @(($u -f "photo-1560869713-7d0a29430803",1200), ($p -f 3993415,1200))
  "nails-1.jpg"       = @(($u -f "photo-1519823551278-64ac92734fb1",1200), ($p -f 1524671,1200))
  "nails-2.jpg"       = @(($u -f "photo-1604654894610-df63bc536371",1200), ($u -f "photo-1559599101-f09722fb4948",1200))
  "nails-3.jpg"       = @(($u -f "photo-1632345031435-8727f6897d53",1200), ($u -f "photo-1457972729786-0411a3b2b626",1200))
  "beauty-1.jpg"      = @(($u -f "photo-1526045478516-99145907023c",1200), ($u -f "photo-1570172619644-dfd03ed5d881",1200))
  "beauty-2.jpg"      = @(($u -f "photo-1512290923902-8a9f81dc236c",1200), ($u -f "photo-1605980625600-07ef91e2c896",1200))
  "beauty-3.jpg"      = @(($u -f "photo-1583847268964-b28dc8f51f92",1200), ($u -f "photo-1596460107916-430662021049",1200))
  "beauty-4.jpg"      = @(($u -f "photo-1596462502278-27bfdc403348",1200), ($p -f 2047905,1200))
  "stylist-1.jpg"     = @(($u -f "photo-1494790108377-be9c29b29330",1000), ($u -f "photo-1438761681033-6461ffad8d80",1000))
  "stylist-2.jpg"     = @(($u -f "photo-1531123897727-8f129e1688ce",1000), ($u -f "photo-1524504388940-b1c1722653e1",1000))
  "stylist-3.jpg"     = @(($u -f "photo-1531746020798-e6953c6e8e04",1000), ($p -f 774909,1000))
  "stylist-4.jpg"     = @(($u -f "photo-1544005313-94ddf0286df2",1000), ($u -f "photo-1517841905240-472988babdf9",1000))
  "stylist-5.jpg"     = @(($u -f "photo-1529626455594-4ff0802cfb7e",1000), ($u -f "photo-1524250502761-1ac6f2e30d43",1000))
  "stylist-6.jpg"     = @(($u -f "photo-1580489944761-15a19d654956",1000), ($u -f "photo-1548142813-c348350df52b",1000))
  "stylist-7.jpg"     = @(($u -f "photo-1519345182560-3f2917c472ef",1000), ($u -f "photo-1534528741775-53994a69daeb",1000))
  "stylist-8.jpg"     = @(($u -f "photo-1507003211169-0a1dd7228f2d",1000), ($u -f "photo-1500648767791-00dcc994a43e",1000))
  "gallery-1.jpg"     = @(($u -f "photo-1487412947147-5cebf100ffc2",1200), ($p -f 2417840,1200))
  "gallery-2.jpg"     = @(($u -f "photo-1522337660859-02fbefca4702",1200), ($p -f 3993449,1200))
  "gallery-3.jpg"     = @(($u -f "photo-1526045478516-99145907023c",1200), ($p -f 415829,1200))
  "gallery-4.jpg"     = @(($u -f "photo-1519699047748-de8e457a634e",1200), ($p -f 1620657,1200))
  "gallery-5.jpg"     = @(($u -f "photo-1519823551278-64ac92734fb1",1200), ($p -f 972995,1200))
  "gallery-6.jpg"     = @(($u -f "photo-1502323777036-f29e3972d82f",1200), ($p -f 1122558,1200))
  "gallery-7.jpg"     = @(($u -f "photo-1522335789203-aabd1fc54bc9",1200), ($p -f 3993310,1200))
  "gallery-8.jpg"     = @(($u -f "photo-1556909212-d5b604d0c90d",1200), ($p -f 1019725,1200))
  "gallery-9.jpg"     = @(($u -f "photo-1560066984-138dadb4c035",1200), ($p -f 322207,1200))
  "gallery-10.jpg"    = @(($u -f "photo-1540555700478-4be289fbecef",1200), ($p -f 3757949,1200))
  "gallery-11.jpg"    = @(($u -f "photo-1583939003579-730e3918a45a",1200), ($p -f 3175241,1200))
  "gallery-12.jpg"    = @(($u -f "photo-1521590832167-7bcbfaa6381f",1200), ($p -f 4846181,1200))
  "product-1.jpg"     = @(($u -f "photo-1608248597279-f99d160bfcbc",1000), ($p -f 5069519,1000))
  "product-2.jpg"     = @(($u -f "photo-1556228720-195a672e8a03",1000), ($u -f "photo-1570172619644-dfd03ed5d881",1000))
  "product-3.jpg"     = @(($u -f "photo-1526947425960-945c6e72858f",1000), ($p -f 322207,1000))
  "product-4.jpg"     = @(($u -f "photo-1512290923902-8a9f81dc236c",1000), ($p -f 415829,1000))
  "product-5.jpg"     = @(($u -f "photo-1605980625600-07ef91e2c896",1000), ($u -f "photo-1620916566398-39f1143ab7be",1000))
  "product-6.jpg"     = @(($u -f "photo-1571781926291-c477ebfd024b",1000), ($p -f 2047905,1000))
  "product-7.jpg"     = @(($u -f "photo-1512496015851-a90fb38ba796",1000), ($u -f "photo-1598440947619-2c35fc9aa908",1000))
  "product-8.jpg"     = @(($u -f "photo-1483985988355-763728e1935b",1000), ($u -f "photo-1441984904996-e0b6ba687e04",1000))
  "product-9.jpg"     = @(($u -f "photo-1513364776144-60967b0f800f",1000), ($p -f 322207,1000))
  "product-10.jpg"    = @(($u -f "photo-1596460107916-430662021049",1000), ($p -f 2047905,1000))
  "product-11.jpg"    = @(($u -f "photo-1598440947619-2c35fc9aa908",1000), ($u -f "photo-1556228720-195a672e8a03",1000))
  "blog-1.jpg"        = @(($u -f "photo-1522337660859-02fbefca4702",1200), ($u -f "photo-1562322140-8baeececf3df",1200))
  "blog-2.jpg"        = @(($u -f "photo-1605497788044-5a32c7078486",1200), ($u -f "photo-1580618837931-7d9e9f1a5e9d",1200))
  "blog-3.jpg"        = @(($u -f "photo-1519741497674-611481863552",1200), ($u -f "photo-1556909212-d5b604d0c90d",1200))
  "blog-4.jpg"        = @(($u -f "photo-1526947425960-945c6e72858f",1200), ($p -f 5069519,1200))
  "blog-5.jpg"        = @(($u -f "photo-1512290923902-8a9f81dc236c",1200), ($p -f 415829,1200))
  "blog-6.jpg"        = @(($u -f "photo-1605497788044-5a32c7078486",1200), ($u -f "photo-1595476108010-b4d1f102b1b1",1200))
}

$fail = @()
foreach ($k in $map.Keys) {
  $out = Join-Path $base $k
  if (Test-Path $out) { Write-Output "SKIP $k"; continue }
  $ok = $false
  foreach ($url in $map[$k]) {
    try {
      $r = Invoke-WebRequest -Uri $url -Method Head -UseBasicParsing -TimeoutSec 20
      if ($r.StatusCode -eq 200) {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -TimeoutSec 90
        if ((Get-Item $out).Length -gt 15000) { $ok = $true; Write-Output "OK   $k"; break }
        Remove-Item $out -Force
      }
    } catch {}
  }
  if (-not $ok) { $fail += $k }
}
if ($fail.Count) { Write-Output "FAILED: $($fail -join ', ')" } else { Write-Output "ALL OK" }
