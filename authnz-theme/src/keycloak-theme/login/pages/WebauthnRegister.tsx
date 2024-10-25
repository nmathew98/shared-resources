import { assert } from "keycloakify/tools/assert";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { useInitialize } from "keycloakify/login/Template.useInitialize";

export default function WebauthnRegister(
	props: PageProps<
		Extract<KcContext, { pageId: "webauthn-register.ftl" }>,
		I18n
	>,
) {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

	const { url, isSetRetry, isAppInitiatedAction } = kcContext;

	const { msg, msgStr } = i18n;

	const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

	if (!isReadyToRender) {
		return null;
	}

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			headerNode={
				<>
					<span className={kcClsx("kcWebAuthnKeyIcon")} />
					{msg("webauthn-registration-title")}
				</>
			}>
			<form
				id="register"
				className={kcClsx("kcFormClass")}
				action={url.loginAction}
				method="post">
				<div className={kcClsx("kcFormGroupClass")}>
					<input
						type="hidden"
						id="clientDataJSON"
						name="clientDataJSON"
					/>
					<input
						type="hidden"
						id="attestationObject"
						name="attestationObject"
					/>
					<input
						type="hidden"
						id="publicKeyCredentialId"
						name="publicKeyCredentialId"
					/>
					<input
						type="hidden"
						id="authenticatorLabel"
						name="authenticatorLabel"
					/>
					<input type="hidden" id="transports" name="transports" />
					<input type="hidden" id="error" name="error" />
					<LogoutOtherSessions kcClsx={kcClsx} i18n={i18n} />
				</div>
			</form>
			<input
				type="submit"
				className={kcClsx(
					"kcButtonClass",
					"kcButtonPrimaryClass",
					"kcButtonBlockClass",
					"kcButtonLargeClass",
				)}
				id="registerWebAuthn"
				value={msgStr("doRegisterSecurityKey")}
				onClick={() => {
					assert("registerSecurityKey" in window);
					assert(typeof window.registerSecurityKey === "function");
					window.registerSecurityKey();
				}}
			/>

			{!isSetRetry && isAppInitiatedAction && (
				<form
					action={url.loginAction}
					className={kcClsx("kcFormClass")}
					id="kc-webauthn-settings-form"
					method="post">
					<button
						type="submit"
						className={kcClsx(
							"kcButtonClass",
							"kcButtonDefaultClass",
							"kcButtonBlockClass",
							"kcButtonLargeClass",
						)}
						id="cancelWebAuthnAIA"
						name="cancel-aia"
						value="true">
						{msg("doCancel")}
					</button>
				</form>
			)}
		</Template>
	);
}

function LogoutOtherSessions(props: { kcClsx: KcClsx; i18n: I18n }) {
	const { kcClsx, i18n } = props;

	const { msg } = i18n;

	return (
		<div id="kc-form-options" className={kcClsx("kcFormOptionsClass")}>
			<div className={kcClsx("kcFormOptionsWrapperClass")}>
				<div className="checkbox">
					<label>
						<input
							type="checkbox"
							id="logout-sessions"
							name="logout-sessions"
							value="on"
							defaultChecked={true}
						/>
						{msg("logoutOtherSessions")}
					</label>
				</div>
			</div>
		</div>
	);
}
