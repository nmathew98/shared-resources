import React, { useState, useEffect, useReducer } from "react";
import { assert } from "keycloakify/tools/assert";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { H4, Small } from "@/components/typography";
import { useTheme } from "@/components/ui/theme-provider";
import {
	LogoGoogle,
	LogoMicrosoft,
	LogoFacebook,
	LogoInstagram,
	LogoTwitter,
	LogoLinkedin,
	LogoStackoverflow,
	LogoGithub,
	LogoGitlab,
	LogoBitbucket,
	LogoPaypal,
	LogoOpenshift,
} from "@/components/assets";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CircleAlert, Eye, EyeOff } from "lucide-react";

const SSO_PROVIDERS_ICONS = {
	google: LogoGoogle,
	microsoft: LogoMicrosoft,
	facebook: LogoFacebook,
	instagram: LogoInstagram,
	twitter: LogoTwitter,
	linkedin: LogoLinkedin,
	stackoverflow: LogoStackoverflow,
	github: LogoGithub,
	gitlab: LogoGitlab,
	bitbucket: LogoBitbucket,
	paypal: LogoPaypal,
	openshift: LogoOpenshift,
};

export const Login = (
	props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>,
) => {
	const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

	const { kcClsx } = getKcClsx({
		doUseDefaultCss,
		classes,
	});

	const {
		social,
		realm,
		url,
		usernameHidden,
		login,
		auth,
		registrationDisabled,
		messagesPerField,
	} = kcContext;

	const { msg, msgStr } = i18n;

	const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
	const { theme } = useTheme();

	const onSubmit = () => {
		setIsLoginButtonDisabled(true);
		return true;
	};

	return (
		<Template
			kcContext={kcContext}
			i18n={i18n}
			doUseDefaultCss={doUseDefaultCss}
			classes={classes}
			displayMessage={
				!messagesPerField.existsError("username", "password")
			}
			headerNode={msg("loginAccountTitle")}
			displayInfo={
				realm.password &&
				realm.registrationAllowed &&
				!registrationDisabled
			}
			infoNode={
				<Button className="w-full" variant="ghost" asChild>
					<a tabIndex={8} href={url.registrationUrl}>
						{msg("noAccount")}&nbsp;{msg("doRegister")}
					</a>
				</Button>
			}
			socialProvidersNode={
				<>
					{realm.password && social.providers?.length && (
						<>
							<div className="flex flex-col items-center gap-4 w-full">
								<H4>{msg("identity-provider-login-label")}</H4>
								<div
									className={
										social.providers.length < 3
											? "flex gap-4"
											: "grid grid-flow-row md:grid-cols-3 w-full gap-4"
									}>
									{social.providers.map(provider => {
										const Logo =
											SSO_PROVIDERS_ICONS[
												provider.providerId as keyof typeof SSO_PROVIDERS_ICONS
											] ?? "span";

										return (
											<Button
												key={provider.providerId}
												asChild
												variant={
													theme === "light"
														? "default"
														: "outline"
												}
												className="px-5 py-6 w-full">
												<a
													className="flex gap-2 items-center"
													href={provider.loginUrl}>
													{provider.iconClasses && (
														<i
															className={clsx(
																kcClsx(
																	"kcCommonLogoIdP",
																),
																provider.iconClasses,
															)}
															aria-hidden="true"></i>
													)}
													<Logo className="w-5 h-auto text-foreground" />

													{provider.displayName}
												</a>
											</Button>
										);
									})}
								</div>
							</div>
						</>
					)}
				</>
			}>
			{realm.password && (
				<form
					className="flex flex-col gap-6"
					method="POST"
					action={url.loginAction}
					onSubmit={onSubmit}>
					{!usernameHidden && (
						<div className="flex flex-col gap-2">
							<Label htmlFor="username">
								{!realm.loginWithEmailAllowed &&
									msg("username")}
								{realm.loginWithEmailAllowed &&
									!realm.registrationEmailAsUsername &&
									msg("usernameOrEmail")}
								{realm.loginWithEmailAllowed &&
									realm.registrationEmailAsUsername &&
									msg("email")}
							</Label>
							<div className="relative">
								<Input
									tabIndex={2}
									id="username"
									name="username"
									type="text"
									autoFocus
									autoComplete="username"
									aria-invalid={messagesPerField.existsError(
										"username",
										"password",
									)}
								/>
								{messagesPerField.existsError("username") && (
									<CircleAlert className="h-5 w-auto text-red-500 absolute top-1/4 right-2" />
								)}
							</div>
							{messagesPerField.existsError("username") && (
								<Small>
									{messagesPerField.getFirstError("username")}
								</Small>
							)}
						</div>
					)}

					<div className="flex flex-col gap-2">
						<Label htmlFor="password">{msg("password")}</Label>
						<PasswordWrapper
							kcClsx={kcClsx}
							i18n={i18n}
							passwordInputId="password">
							<div className="relative">
								<Input
									tabIndex={3}
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									aria-invalid={messagesPerField.existsError(
										"username",
										"password",
									)}
								/>
								{messagesPerField.existsError("password") && (
									<CircleAlert className="h-5 w-auto text-red-500 absolute top-1/4 right-2" />
								)}
							</div>
						</PasswordWrapper>
						{messagesPerField.existsError("password") && (
							<Small>
								{messagesPerField.getFirstError("password")}
							</Small>
						)}
					</div>
					{realm.rememberMe && !usernameHidden && (
						<div className="flex items-center gap-2">
							<Checkbox
								tabIndex={5}
								id="rememberMe"
								name="rememberMe"
								defaultChecked={Boolean(login.rememberMe)}
							/>
							<Label htmlFor="rememberMe">
								{msg("rememberMe")}
							</Label>
						</div>
					)}

					<div className="flex flex-col gap-2">
						{realm.resetPasswordAllowed && (
							<Button variant="secondary" className="w-full">
								<a
									tabIndex={6}
									href={url.loginResetCredentialsUrl}>
									{msg("doForgotPassword")}
								</a>
							</Button>
						)}
						<div>
							<input
								type="hidden"
								id="id-hidden-input"
								name="credentialId"
								value={auth.selectedCredential}
							/>

							<Button
								className="w-full cursor-pointer"
								disabled={isLoginButtonDisabled}
								tabIndex={7}
								asChild>
								<input
									name="login"
									id="kc-login"
									type="submit"
									value={msgStr("doLogIn")}
								/>
							</Button>
						</div>
					</div>
				</form>
			)}
		</Template>
	);
};

const PasswordWrapper = (props: {
	kcClsx: KcClsx;
	i18n: I18n;
	passwordInputId: string;
	children: JSX.Element;
}) => {
	const { i18n, passwordInputId, children } = props;

	const { msgStr } = i18n;

	const [isPasswordRevealed, toggleIsPasswordRevealed] = useReducer(
		(isPasswordRevealed: boolean) => !isPasswordRevealed,
		false,
	);

	useEffect(() => {
		const passwordInputElement = document.getElementById(passwordInputId);

		assert(passwordInputElement instanceof HTMLInputElement);

		passwordInputElement.type = isPasswordRevealed ? "text" : "password";
	}, [isPasswordRevealed]);

	const onClickTogglePassword: React.MouseEventHandler<
		HTMLButtonElement
	> = event => {
		event.preventDefault();

		toggleIsPasswordRevealed();
	};

	return (
		<div className="flex gap-1">
			<div className="w-full">{children}</div>
			<Button
				variant="outline"
				className="w-max"
				onClick={onClickTogglePassword}
				aria-label={msgStr(
					isPasswordRevealed ? "hidePassword" : "showPassword",
				)}
				aria-controls={passwordInputId}>
				{isPasswordRevealed && (
					<Eye aria-hidden className="h-5 w-auto" />
				)}
				{!isPasswordRevealed && (
					<EyeOff aria-hidden className="h-5 w-auto" />
				)}
			</Button>
		</div>
	);
};
