// src/components/Layout/Sidebar.jsx
import {FC, ReactNode, useCallback, useState} from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

// It's cleaner to define icons as constants or separate components.
  const IconGrid2: ReactNode = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
  );

  const IconPackage: ReactNode = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
  );

  const IconShoppingBag: ReactNode = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
  );

  const IconReceipt: ReactNode = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
  );

  const IconUsers: ReactNode = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
  );

  const IconChartBar: ReactNode = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
  );

  const IconChevronDoubleRight: ReactNode = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
  );

  const IconChevronDoubleLeft: ReactNode = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
  );

  const menuItems:Array<{
    title: string;
    path: string;
    icon: ReactNode; // Using ReactNode to allow any renderable type, including JSX for icons
  }> = [
    { title: 'Dashboard', path: '/', icon: IconGrid2 },
    { title: 'Inventory', path: '/inventory', icon: IconPackage },
    { title: 'Products', path: '/products', icon: IconShoppingBag },
    { title: 'Sales', path: '/sales', icon: IconReceipt },
    { title: 'Customers', path: '/customers', icon: IconUsers },
    { title: 'Reports', path: '/reports', icon: IconChartBar },
  ];

  // useCallback to memoize the function, preventing re-creation if location.pathname hasn't changed.
  const isActive = useCallback(
      (path: string): boolean => {
        // Check for exact match or if the current path starts with the item's path (for nested routes)
        // Ensure trailing slash consistency if base path is '/'
        if(path === '/'){
          return location.pathname === '/';
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);

      },
      [location.pathname]
  );

  const toggleCollapse = (): void => {
    setIsCollapsed(prev => !prev);
  };


  return (
    <div
      className={`bg-gray-900 text-white min-h-screen transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 flex justify-end">
        <button
          onClick={toggleCollapse}
          className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" // Added focus ring for accessibility
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed} // Indicates the state of the controlled region
        >
          {isCollapsed ? IconChevronDoubleRight : IconChevronDoubleLeft}
        </button>
      </div>

      <nav className="mt-5">
        <ul>
          {/*{menuItems.map((item) => (*/}
          {/*  <li key={item.path} className="mb-1">*/}
          {/*    <Link*/}
          {/*      to={item.path}*/}
          {/*      className={`flex items-center px-4 py-3 ${*/}
          {/*        isActive(item.path)*/}
          {/*          ? 'bg-blue-600 text-white'*/}
          {/*          : 'text-gray-400 hover:bg-gray-800 hover:text-white'*/}
          {/*      }`}*/}
          {/*    >*/}
          {/*      <span className="mr-3">{item.icon}</span>*/}
          {/*      {!isCollapsed && <span>{item.title}</span>}*/}
          {/*    </Link>*/}
          {/*  </li>*/}
          {/*))}*/}
          {
            menuItems.map((item) =>{
              const active = isActive(item.path);
              return(
                  <li key={item.path} className="mb-1">
                    <Link
                        to={item.path}
                        className={`flex items-center px-4 py-3 transition-colors duration-150 ease-in-out ${
                            active
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        } ${isCollapsed ? 'justify-center' : ''}`} // Center icon when collapsed
                        aria-current={active ? 'page' : undefined} // Accessibility for active link
                        >
                      <span className={`m3-3 ${isCollapsed ? 'mr-0' : ''}`}>{item.icon}</span>
                      {
                        !isCollapsed && <span className='truncate'>{item.title}</span>
                      }
                    </Link>
                  </li>
              )
            })
          }
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;