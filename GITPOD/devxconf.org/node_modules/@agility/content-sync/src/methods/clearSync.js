import { logSuccess } from '../util'

export default async function () {
    const storeInterface = this.store;
	await storeInterface.clear();
	logSuccess(`Cleared Sync Items`);
}
