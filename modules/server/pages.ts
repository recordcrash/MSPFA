import type { IncomingMessage } from 'http';
import type { GetServerSideProps } from 'next';
import type { MyAppInitialProps } from 'pages/_app';
import type { UserDocument } from 'modules/server/users';

export type PageRequest = IncomingMessage & {
	user?: UserDocument,
	appProps: MyAppInitialProps
};

type MyGetServerSidePropsContext = {
	req: PageRequest,
	params: Record<string, string | undefined>
};

export type MyGetServerSideProps<
	ServerSideProps extends Record<string, any> = {}
> = (
	GetServerSideProps extends (context: infer Context) => any
		? (
			context: Omit<Context, keyof MyGetServerSidePropsContext> & MyGetServerSidePropsContext
		) => Promise<{
			props: ServerSideProps
		}>
		: never
);