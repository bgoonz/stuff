datasette .data/data.db \
  -p 3000 \
  -m metadata.json \
  --cors \
  --config default_cache_ttl:0
