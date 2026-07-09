"use server";

import { createServerFn } from "@tanstack/react-start";
import * as fs from "fs";
import * as path from "path";
import type { Recipe } from "./coverEngine";
import { compileTypst, generateTypstCode } from "./coverTypst";

export const renderCoverFn = createServerFn({ method: "POST" })
	.validator(
		(d: {
			main: Recipe;
			characters: Recipe[];
			title: string;
		}): { main: Recipe; characters: Recipe[]; title: string } => d,
	)
	.handler(async ({ data }) => {
		try {
			const code = generateTypstCode(data.main, data.characters, data.title);
			const tmpDir = path.resolve(process.cwd(), ".temp-typst");
			if (!fs.existsSync(tmpDir)) {
				fs.mkdirSync(tmpDir, { recursive: true });
			}
			const outputSvgPath = path.join(tmpDir, `render-${Date.now()}.svg`);

			await compileTypst(code, outputSvgPath);

			if (fs.existsSync(outputSvgPath)) {
				const svgContent = fs.readFileSync(outputSvgPath, "utf-8");
				fs.unlinkSync(outputSvgPath);
				return { success: true, svg: svgContent };
			}

			return { success: false, error: "Failed to compile Typst cover." };
		} catch (err: any) {
			console.error("Typst server compilation failed:", err);
			return { success: false, error: err.message || String(err) };
		}
	});
