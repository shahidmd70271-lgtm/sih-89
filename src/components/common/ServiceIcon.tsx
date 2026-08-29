import React from 'react';
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  Car,
  Trees,
  Cpu,
  HeartHandshake,
  KeyRound,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { ServiceType } from '../../types';

interface ServiceIconProps {
  name: string | ServiceType;
  className?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Plumbing':
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Electrical':
    case 'Zap':
      return <Zap className={className} />;
    case 'Carpentry':
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Painting':
    case 'Paintbrush':
      return <Paintbrush className={className} />;
    case 'Cleaning':
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Driving':
    case 'Car':
      return <Car className={className} />;
    case 'Gardening':
    case 'Trees':
      return <Trees className={className} />;
    case 'Appliance Repair':
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Caregiving':
    case 'HeartHandshake':
      return <HeartHandshake className={className} />;
    case 'Locksmith & Security':
    case 'KeyRound':
      return <KeyRound className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    default:
      return <Briefcase className={className} />;
  }
};
