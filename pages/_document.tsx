import { Html, Head, Body } from '@nokkio/doc';

export default function Doc({ children }: { children: React.ReactNode }) {
  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta property="og:site_name" content="Photo Roll" />
        <title>Photo Roll</title>
      </Head>
      <Body className="bg-gray-50">
        <div id="main">{children}</div>
      </Body>
    </Html>
  );
}
