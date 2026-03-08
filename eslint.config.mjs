import globals from "globals";
import vuePlugin from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
	{
		ignores: ["dist/**"]
	},
	{
		files: ["src/**/*.js", "src/**/*.vue"],
		languageOptions: {
			parser: vueParser,
			globals: {
				...globals.browser,
				...globals.webextensions,
                ...globals.es2020
			},
			parserOptions: {
				ecmaVersion: 2022
			},
		},
		plugins: {
			vuePlugin
		},
		rules: {
            "no-unused-vars": [
                "error",
                {
                  "args": "after-used",
                  "argsIgnorePattern": "^_"
                }
              ],
            "eqeqeq": ["error", "always", {"null": "ignore"}]
		}
	},
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: tsParser,
			globals: {
				...globals.browser,
				...globals.webextensions,
				...globals.es2020
			},
			parserOptions: {
				ecmaVersion: 2022
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin
		},
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					"args": "after-used",
					"argsIgnorePattern": "^_"
				}
			],
			"eqeqeq": ["error", "always", {"null": "ignore"}]
		}
	}
]
