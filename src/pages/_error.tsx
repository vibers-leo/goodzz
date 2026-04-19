function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#333' }}>{statusCode || '오류'}</h1>
        <p style={{ color: '#666', marginTop: '16px' }}>
          {statusCode === 404 ? '페이지를 찾을 수 없습니다.' : '문제가 발생했습니다. 잠시 후 다시 시도해주세요.'}
        </p>
        <a href="/" style={{ color: '#8b5cf6', marginTop: '24px', display: 'inline-block' }}>홈으로 돌아가기</a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
