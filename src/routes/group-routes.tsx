import React from 'react';
import { Route } from 'react-router-dom';
import Groups from '@/components/Groups';

export const groupRoutes = [
  <Route key="groups" path="/groups" element={<Groups />} />,
  <Route key="groups-create" path="/groups/create" element={<Groups />} />
]; 