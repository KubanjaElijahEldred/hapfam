import React from 'react';
import { DepartmentShell } from '../../src/components/Shell';
import { QualityDashboard } from '../../src/modules/quality/QualityDashboard';

export default function Page() {
  return <DepartmentShell dept="quality"><QualityDashboard /></DepartmentShell>;
}
