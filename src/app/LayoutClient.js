"use client"
import { usePathname } from 'next/navigation';
import { Menu, MainMenu } from '@/components/Menu';
import { Provider } from 'react-redux';
import store from '@/model/reducer';
import { UpdatedSection } from '@/components/UpdatedSection';

export default function LayoutClient({ children }) {
    const pathname = usePathname();

    const isHome = pathname === '/' || pathname === '/StarRailApi/';

    let backgroundClass = isHome ? 'MainBackGround' : 'SubBackGround';
    if (process.env.NODE_ENV === 'production') {
        backgroundClass += '-release';
    }

    return (
      <div className={backgroundClass}>
          
          {isHome ? (<MainMenu />) : (
              <>
                <Menu />
                <div className="min-h-[100vh]">
                    <Provider store={store}>
                        <UpdatedSection />
                        {children}
                    </Provider>
                </div>
              </>
          )}
      </div>
    );
}
