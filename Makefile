run_local:
	docker-compose -f docker-compose-local.yml up

run_ui:
	cd crm_ui && flutter run -d web-server