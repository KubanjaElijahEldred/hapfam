import React from 'react';
import { DepartmentShell } from '../../src/components/Shell';
import { ProductionDashboard } from '../../src/modules/production/ProductionDashboard';

export default function Page() {
  return <DepartmentShell dept="production"><ProductionDashboard /></DepartmentShell>;
}
