import React from 'react';
import { DepartmentShell } from '../../src/components/Shell';
import { ManagementDashboard } from '../../src/modules/management/ManagementDashboard';
export default function Page() {
  return <DepartmentShell dept="management"><ManagementDashboard /></DepartmentShell>;
}
