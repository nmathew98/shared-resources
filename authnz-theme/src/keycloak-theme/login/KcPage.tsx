import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import { Template } from "./Template";

const UserProfileFormFields = lazy(() => import("./UserProfileFormFields"));

const doMakeUserConfirmPassword = true;

export default function KcPage(props: { kcContext: KcContext }) {
	const { kcContext } = props;

	const { i18n } = useI18n({ kcContext });

	return (
		<Suspense>
			{(() => {
				switch (kcContext.pageId) {
					default:
						return (
							<DefaultPage
								kcContext={kcContext}
								i18n={i18n}
								classes={classes}
								Template={Template}
								doUseDefaultCss={false} // TODO: disable?
								UserProfileFormFields={UserProfileFormFields}
								doMakeUserConfirmPassword={
									doMakeUserConfirmPassword
								}
							/>
						);
				}
			})()}
		</Suspense>
	);
}

const classes = {} satisfies { [key in ClassKey]?: string };
