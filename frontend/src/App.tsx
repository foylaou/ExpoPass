import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { EventForm } from './pages/EventForm';
import { Attendees } from './pages/Attendees';
import { AttendeeForm } from './pages/AttendeeForm';
import { QRCodes } from './pages/QRCodes';
import { Scan } from './pages/Scan';
import { Reports } from './pages/Reports';
import { Booths } from './pages/Booths';
import { BoothForm } from './pages/BoothForm';
import { Toaster } from "react-hot-toast";
import type {PageMetaData} from './pageMetaMap';

import React from "react";

interface AppProps {
  pageMetaData?: PageMetaData;
}

function App({ pageMetaData }: AppProps): React.JSX.Element {
  return (
    <HelmetProvider>
      <Router>
        {pageMetaData && (
          <Helmet>
            <title>{pageMetaData.title}</title>
            <meta name="description" content={pageMetaData.description} />
            <meta property="og:title" content={pageMetaData.title} />
            <meta property="og:description" content={pageMetaData.description} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageMetaData.title} />
            <meta name="twitter:description" content={pageMetaData.description} />
          </Helmet>
        )}
        <Layout>
          <Toaster
            position="top-center"
          />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/create" element={<EventForm />} />
            <Route path="/events/:id/edit" element={<EventForm />} />
            <Route path="/attendees" element={<Attendees />} />
            <Route path="/attendees/create" element={<AttendeeForm />} />
            <Route path="/attendees/:id/edit" element={<AttendeeForm />} />
            <Route path="/booths" element={<Booths />} />
            <Route path="/booths/create" element={<BoothForm />} />
            <Route path="/booths/:id/edit" element={<BoothForm />} />
            <Route path="/qrcodes" element={<QRCodes />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}

export default App;
