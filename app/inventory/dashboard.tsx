import React from 'react';
import { DepartmentShell } from '../../src/components/Shell';
import { InventoryDashboard } from '../../src/modules/inventory/InventoryDashboard';

export default function Page() {
  return <DepartmentShell dept="inventory"><InventoryDashboard /></DepartmentShell>;
}
