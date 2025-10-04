import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type TabType = 'all' | 'ongoing' | 'upcoming' | 'ended';

interface NavigationState {
  activeTab: TabType;
  currentPageName: string;
  currentPath: string;
}

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  const getInitialState = (): NavigationState => {
    if (!pathname) {
      return { activeTab: 'all', currentPageName: 'Events', currentPath: '/' };
    }

    if (pathname.includes('/events')) {
      return { activeTab: 'all', currentPageName: 'Events', currentPath: pathname };
    } else if (pathname.includes('/organizers')) {
      return { activeTab: 'ongoing', currentPageName: 'Organizers', currentPath: pathname };
    } else if (pathname.includes('/speakers')) {
      return { activeTab: 'upcoming', currentPageName: 'Speakers', currentPath: pathname };
    } else if (pathname.includes('/manage-events')) {
      return { activeTab: 'ended', currentPageName: 'Manage Events', currentPath: pathname };
    }
    
    return { activeTab: 'all', currentPageName: 'Events', currentPath: pathname };
  };
  
  const [state, setState] = useState<NavigationState>(getInitialState());
  
  useEffect(() => {
    setState(getInitialState());
  }, [pathname]);
  
  const handleTabChange = (tab: TabType) => {
    if (
      (tab === 'all' && pathname && pathname.includes('/events')) ||
      (tab === 'ongoing' && pathname && pathname.includes('/organizers')) ||
      (tab === 'upcoming' && pathname && pathname.includes('/speakers')) ||
      (tab === 'ended' && pathname && pathname.includes('/manage-events'))
    ) {
      return;
    }
    
    if (tab === 'all') {
      router.push('/events');
    } else if (tab === 'ongoing') {
      router.push('/organizers');
    } else if (tab === 'upcoming') {
      router.push('/speakers');
    } else if (tab === 'ended') {
      router.push('/manage-events');
    }
  };
  
  return {
    activeTab: state.activeTab,
    currentPageName: state.currentPageName,
    handleTabChange
  };
} 