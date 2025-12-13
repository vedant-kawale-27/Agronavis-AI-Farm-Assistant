import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/images/favicon.png" />
        <meta name="description" content="AgroNavis - Smart Farm Monitoring and Management System" />
        {/* Viewport meta tag moved to _app.tsx */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}