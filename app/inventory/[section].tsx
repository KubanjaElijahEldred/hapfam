import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { DepartmentShell } from '../../src/components/Shell';
import { SectionPage } from '../../src/components/SectionPage';

export default function Page() {
  const { section } = useLocalSearchParams<{ section: string }>();
  return <DepartmentShell dept="inventory"><SectionPage dept="inventory" section={section || ''} /></DepartmentShell>;
}
