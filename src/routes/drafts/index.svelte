<script context="module">
	import { getUpcomingDraft, getPreviousDrafts, getLeagueRecords } from '$lib/utils/helper';

    export async function load() {
        const upcomingDraftData = getUpcomingDraft();
        const previousDraftsData = getPreviousDrafts();
        const records = await getLeagueRecords();
	
		return {
			props: {
				upcomingDraftData,
                previousDraftsData,
                records,
			}
		};
	}
</script>

<script>
	import { Drafts } from '$lib/components';

    export let upcomingDraftData, previousDraftsData, records;
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
    }
</style>

<div id="main">
	<Drafts {upcomingDraftData} {previousDraftsData} records={records.playerRanks} />
</div>