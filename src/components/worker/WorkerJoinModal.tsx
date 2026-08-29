import React from 'react';
import { WorkerRegistrationDrawer } from './WorkerRegistrationDrawer';

interface WorkerJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkerJoinModal: React.FC<WorkerJoinModalProps> = (props) => {
  return <WorkerRegistrationDrawer {...props} />;
};

export { WorkerRegistrationDrawer };
