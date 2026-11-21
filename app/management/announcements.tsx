import React from 'react';
import { DepartmentShell } from '../../src/components/Shell';
import { AnnouncementCenter } from '../../src/components/AnnouncementCenter';
export default function Page() {
  return <DepartmentShell dept="management"><AnnouncementCenter dept="management" /></DepartmentShell>;
}
