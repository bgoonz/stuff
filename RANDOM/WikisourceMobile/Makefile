app: sitematrix i18n

sitematrix:
	curl -o assets/www/sitematrix.json \
		"http://en.wikipedia.org/w/api.php?action=sitematrix&format=json"

i18n:
	python scripts/setI18n.py
