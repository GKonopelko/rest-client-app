import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userSlice from '@/slices/userSlice';
import AppMainPage from './MainPage';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn(),
  Provider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('AppMainPage Component', () => {
  let store: ReturnType<typeof configureStore>;
  const mockRouter = {
    push: vi.fn(),
  };
  const mockUseTranslations = vi.fn();

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userSlice,
      },
    });

    (useRouter as Mock).mockReturnValue(mockRouter);
    (useTranslations as Mock).mockReturnValue(mockUseTranslations);
    (useSelector as unknown as Mock).mockImplementation((selector) =>
      selector({ user: { name: '' } })
    );

    mockUseTranslations.mockImplementation(
      (key: string, values?: { name?: string }) => {
        const translations: Record<string, string> = {
          welcomeBack: values?.name
            ? `Welcome back, ${values.name}!`
            : 'Welcome back, {name}!',
          welcomeBackDescription: 'Continue working with our tools',
          welcome: 'Welcome to our application',
          welcomeDescription: 'Sign in to access all features',
          restClient: 'REST Client',
          history: 'History',
          variables: 'Variables',
          developersHeader: 'Developers',
          developersDescription: 'Our team consists of:',
          developer1: 'Developer 1',
          developer2: 'Developer 2',
          developer3: 'Developer 3',
          projectHeader: 'About the Project',
          projectDescription: 'This is a REST client application',
          keyFeatures: 'Key Features:',
          feature1: 'Feature 1',
          feature2: 'Feature 2',
          feature3: 'Feature 3',
          feature4: 'Feature 4',
          feature5: 'Feature 5',
          feature6: 'Feature 6',
          feature7: 'Feature 7',
          courseHeader: 'Course Information',
          courseDescription: 'This project was developed as part of the course',
          courseLink: 'ReactJS Course',
          courseHighlights: 'Course Highlights:',
          highlight1: 'Highlight 1',
          highlight2: 'Highlight 2',
          highlight3: 'Highlight 3',
          highlight4: 'Highlight 4',
          highlight5: 'Highlight 5',
        };
        return translations[key] || key;
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderMainPage = (userName = '') => {
    (useSelector as unknown as Mock).mockImplementation((selector) =>
      selector({ user: { name: userName } })
    );

    if (userName) {
      (useTranslations as Mock).mockImplementation(
        () => (key: string, values?: { name?: string }) => {
          if (key === 'welcomeBack' && values?.name) {
            return `Welcome back, ${values.name}!`;
          }
          return mockUseTranslations(key, values);
        }
      );
    }

    return render(
      <Provider store={store}>
        <AppMainPage />
      </Provider>
    );
  };

  it('renders welcome message for logged out user', () => {
    renderMainPage();
    expect(screen.getByText('Welcome to our application')).toBeInTheDocument();
    expect(
      screen.getByText('Sign in to access all features')
    ).toBeInTheDocument();
  });

  it('renders welcome back message for logged in user', () => {
    renderMainPage('Test User');
    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    expect(
      screen.getByText('Continue working with our tools')
    ).toBeInTheDocument();
  });

  it('shows action buttons for logged in user', () => {
    renderMainPage('Test User');
    expect(screen.getByText('REST Client')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('navigates to rest client page when REST Client button is clicked', () => {
    renderMainPage('Test User');
    fireEvent.click(screen.getByText('REST Client'));
    expect(mockRouter.push).toHaveBeenCalledWith('/rest-client');
  });

  it('navigates to history page when History button is clicked', () => {
    renderMainPage('Test User');
    fireEvent.click(screen.getByText('History'));
    expect(mockRouter.push).toHaveBeenCalledWith('/history');
  });

  it('navigates to variables page when Variables button is clicked', () => {
    renderMainPage('Test User');
    fireEvent.click(screen.getByText('Variables'));
    expect(mockRouter.push).toHaveBeenCalledWith('/variables');
  });

  it('renders developers section', () => {
    renderMainPage();
    expect(screen.getByText('Developers')).toBeInTheDocument();

    const developersSection = screen.getByText('Developers').closest('article');
    expect(developersSection).toBeInTheDocument();
    expect(developersSection).toHaveTextContent('Our team consists of:');

    expect(screen.getByText('Developer 1')).toBeInTheDocument();
    expect(screen.getByText('Developer 2')).toBeInTheDocument();
    expect(screen.getByText('Developer 3')).toBeInTheDocument();
  });

  it('renders project information section', () => {
    renderMainPage();
    expect(screen.getByText('About the Project')).toBeInTheDocument();
    expect(
      screen.getByText('This is a REST client application')
    ).toBeInTheDocument();
    expect(screen.getByText('Key Features:')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 7')).toBeInTheDocument();
  });

  it('renders course information section', () => {
    renderMainPage();
    expect(screen.getByText('Course Information')).toBeInTheDocument();
    expect(
      screen.getByText('This project was developed as part of the course')
    ).toBeInTheDocument();
    expect(screen.getByText('ReactJS Course')).toBeInTheDocument();
    expect(screen.getByText('Course Highlights:')).toBeInTheDocument();
    expect(screen.getByText('Highlight 1')).toBeInTheDocument();
    expect(screen.getByText('Highlight 5')).toBeInTheDocument();
  });

  it('does not show action buttons for logged out user', () => {
    renderMainPage();
    expect(screen.queryByText('REST Client')).not.toBeInTheDocument();
    expect(screen.queryByText('History')).not.toBeInTheDocument();
    expect(screen.queryByText('Variables')).not.toBeInTheDocument();
  });
});
