import React from 'react';
import { 
  FadeIn,
  SlideInFromTop,
  Container
} from '@/components/ui';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useNavigation } from '@/lib/hooks/useNavigation';

interface PageNavigationProps {
  showBreadcrumb?: boolean;
}

export function PageNavigation({ showBreadcrumb = true }: PageNavigationProps) {
  const { activeTab, currentPageName, handleTabChange } = useNavigation();
  
  return (
    <div className="mb-8">
      {showBreadcrumb && (
        <SlideInFromTop>
          <Breadcrumb className="mb-6">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-primary">{currentPageName}</span>
            </BreadcrumbItem>
          </Breadcrumb>
        </SlideInFromTop>
      )}

      {/* <FadeIn delay={100}>
        <div className="border-b border-border">
          <div className="flex flex-wrap -mb-px">
            <button
              className={`mr-2 inline-block p-4 border-b-2 rounded-t-lg transition-colors duration-200 ${
                activeTab === 'all'
                  ? 'text-primary border-primary'
                  : 'border-transparent hover:text-primary/70 hover:border-primary/30'
              }`}
              onClick={() => handleTabChange('all')}
            >
              All Events 1
            </button>
             <button
              className={`mr-2 inline-block p-4 border-b-2 rounded-t-lg transition-colors duration-200 ${
                activeTab === 'ongoing'
                  ? 'text-primary border-primary'
                  : 'border-transparent hover:text-primary/70 hover:border-primary/30'
              }`}
              onClick={() => handleTabChange('ongoing')}
            >
              Organizers
            </button>
            <button
              className={`mr-2 inline-block p-4 border-b-2 rounded-t-lg transition-colors duration-200 ${
                activeTab === 'upcoming'
                  ? 'text-primary border-primary'
                  : 'border-transparent hover:text-primary/70 hover:border-primary/30'
              }`}
              onClick={() => handleTabChange('upcoming')}
            >
              Speakers
            </button>
            <button
              className={`mr-2 inline-block p-4 border-b-2 rounded-t-lg transition-colors duration-200 ${
                activeTab === 'ended'
                  ? 'text-primary border-primary'
                  : 'border-transparent hover:text-primary/70 hover:border-primary/30'
              }`}
              onClick={() => handleTabChange('ended')}
            >
              Manage Events
            </button> 
          </div>
        </div>
      </FadeIn> */}
    </div>
  );
} 