import type { PageData } from './$types';

export function createCustomerEditState(getData: () => PageData) {
	const d = getData();
	let company = $state(d.customer.company);
	let phone = $state(d.customer.phone ?? '');
	let email = $state(d.customer.email ?? '');
	let notes = $state(d.customer.notes ?? '');
	let submitting = $state(false);

	function startSubmitting() {
		submitting = true;
	}

	function stopSubmitting() {
		submitting = false;
	}

	return {
		get company() {
			return company;
		},
		set company(v: string) {
			company = v;
		},
		get phone() {
			return phone;
		},
		set phone(v: string) {
			phone = v;
		},
		get email() {
			return email;
		},
		set email(v: string) {
			email = v;
		},
		get notes() {
			return notes;
		},
		set notes(v: string) {
			notes = v;
		},
		get submitting() {
			return submitting;
		},
		startSubmitting,
		stopSubmitting
	};
}
