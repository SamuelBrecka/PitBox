import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string, replace?: boolean) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);
const ParamsContext = createContext<Record<string, string>>({});

export const Router: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, replace = false) => {
    if (replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    setPath(to);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a Router provider');
  }
  return context;
};

export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};

export const useLocation = () => {
  const { path } = useRouter();
  return { pathname: path };
};

export const useParams = <T extends Record<string, string>>(): T => {
  return useContext(ParamsContext) as T;
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
}

export const Link: React.FC<LinkProps> = ({ to, replace, onClick, children, ...rest }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      navigate(to, replace);
    }
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
};

export const Route: React.FC<{ path: string; element: React.ReactNode }> = ({ element }) => {
  return <>{element}</>;
};

function matchPattern(pattern: string, pathname: string): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return { match: false, params: {} };
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return { match: false, params: {} };
    }
  }

  return { match: true, params };
}

export const Routes: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { path } = useRouter();

  let matchedElement: React.ReactNode = null;
  let matchedParams: Record<string, string> = {};

  React.Children.forEach(children, (child) => {
    if (!matchedElement && React.isValidElement(child)) {
      const childPath = (child.props as { path?: string }).path;
      if (childPath) {
        const { match, params } = matchPattern(childPath, path);
        if (match) {
          matchedElement = (child.props as { element?: React.ReactNode }).element ?? child;
          matchedParams = params;
        }
      }
    }
  });

  const memoizedParams = useMemo(() => matchedParams, [matchedParams]);

  return (
    <ParamsContext.Provider value={memoizedParams}>
      {matchedElement}
    </ParamsContext.Provider>
  );
};

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace = true }) => {
  const { navigate } = useRouter();

  useEffect(() => {
    navigate(to, replace);
  }, [navigate, to, replace]);

  return null;
};
