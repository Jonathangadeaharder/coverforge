import * as fs from "fs";
import * as path from "path";
import { generateMultiCoverPlan } from "./src/lib/coverEngine";
import { compileTypst, generateTypstCode } from "./src/lib/coverTypst";

const SERIES_METADATA = [
	{
		key: "taskmaster-sweden",
		title: "BÄST I TEST",
		genre: "Comedy / Show",
		description:
			"A Swedish game show. An old woman, Babben, with glasses, royal prestige gold palette, prestige typography, short hair.",
	},
	{
		key: "extra-english",
		title: "EXTRA ENGLISH",
		genre: "Comedy / Learning",
		description:
			"An English learning sitcom. A young adult woman, Annie, with long blond hair, none accessory, pastel indie palette, arthouse typography.",
	},
	{
		key: "extra-french",
		title: "EXTRA FRENCH",
		genre: "Comedy / Learning",
		description:
			"A French learning sitcom. A young adult woman, Sacha, with long brown hair, none accessory, pastel indie palette, arthouse typography.",
	},
	{
		key: "extra-spanish",
		title: "EXTRA SPANISH",
		genre: "Comedy / Learning",
		description:
			"A Spanish learning sitcom. A young adult woman, Lola, with long blond hair, none accessory, sunny warm comedy palette, arthouse typography.",
	},
	{
		key: "jojo-sucht-das-glueck",
		title: "JOJO SUCHT DAS GLÜCK",
		genre: "Drama / Romance",
		description:
			"Eine romantische deutsche Telenovela. A young adult woman, Jojo, with long brown hair, none accessory, romance love palette, prestige typography.",
	},
	{
		key: "lmaktoub",
		title: "LMAKTOUB",
		genre: "Drama / Telenovela",
		description:
			"A Moroccan drama series. A young adult woman, Hind, with long black hair, none accessory, sunset drama blood palette, prestige typography.",
	},
	{
		key: "nicos-weg",
		title: "NICOS WEG",
		genre: "Drama / Learning",
		description:
			"A German learning drama series. A young adult man, Nico, with short black hair, beard bart, neon cyber palette, arthouse typography.",
	},
];

const ARTIFACT_DIR =
	"/Users/jonathangadeaharder/.gemini/antigravity-ide/brain/eb0e6b87-7c0a-4527-9b89-87502e238433";

async function main() {
	console.log(
		"Generating high-fidelity PNG thumbnails for artifact gallery...",
	);

	for (const item of SERIES_METADATA) {
		const plan = await generateMultiCoverPlan(
			item.title,
			item.description,
			item.genre,
		);
		const typstCode = generateTypstCode(plan.main, plan.characters, item.title);

		const outputPath = path.join(ARTIFACT_DIR, `${item.key}_typst.png`);
		await compileTypst(typstCode, outputPath);
		console.log(`Saved thumbnail: ${outputPath}`);
	}
}

main().catch(console.error);
