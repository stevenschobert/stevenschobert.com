default: install build start

install:
	@npm install

clean:
	@rm -rf public/assets/stylesheets/

build: styles scripts

start:
	@npm start

start_admin:
	@node ./scripts/start_admin.js

watch:
	@./node_modules/.bin/supervisor -w lib scripts/start.js

watch_admin:
	@./node_modules/.bin/supervisor -w lib scripts/start_admin.js

test:
	@npm test

styles:
	@./node_modules/.bin/gulp all_styles

scripts:
	@./node_modules/.bin/gulp all_scripts

scripts_admin:
	@./node_modules/.bin/gulp scripts_admin

.PHONY: install clean build start test styles scripts start_admin scripts_admin watch watch_admin
