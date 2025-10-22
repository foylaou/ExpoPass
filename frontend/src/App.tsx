import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Attendees } from './pages/Attendees/Attendees.tsx';
import { AttendeeForm } from './pages/Attendees/AttendeeForm.tsx';
import { QRCodes } from './pages/QRCodes';
import { Scan } from './pages/Scan';

import { BoothsPage } from './pages/Booths/Booths.tsx';
import { BoothForm } from './pages/Booths/BoothForm.tsx';
import { BoothDetail } from './pages/booths/BoothDetail.tsx';
import { BoothLayout } from './pages/booths/BoothLayout.tsx';
import { Toaster } from "react-hot-toast";
import type {PageMetaData} from './pageMetaMap';

import React from "react";
import {Events} from "./pages/Events/Events.tsx";
import {EventForm} from "./pages/Events/EventForm.tsx";
import {Reports} from "./pages/Reports.tsx";

interface AppProps {
  pageMetaData?: PageMetaData;
}

function App({ pageMetaData }: AppProps): React.JSX.Element {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
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
          <Toaster position="top-center" />
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Events />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/create"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <EventForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <EventForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Attendees />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendees/create"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AttendeeForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendees/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <AttendeeForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/booths"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <BoothsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/booths/create"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <BoothForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/booths/layout"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <BoothLayout />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/booths/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <BoothForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/booths/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <BoothDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/qrcodes"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <QRCodes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/scan"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Scan />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
