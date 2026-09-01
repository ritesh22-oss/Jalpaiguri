import { Doctor, Hospital } from '../types';

export const OFFICIAL_DOCTORS: Doctor[] = [];

export const OFFICIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Jalpaiguri District Sadar Hospital & Super Speciality',
    distance: '1.2 km',
    openHours: 'Open 24 Hours',
    is24x7: true,
    hasEmergency: true,
    hasICU: true,
    hasBloodBank: true,
    hasAmbulance: true,
    departments: ['Emergency Trauma Care', 'ICU & CCU', 'Maternity & Child Health', 'General Surgery', 'Cardiology Unit', 'Blood Bank'],
    phone: '03561-230006',
    address: 'Hospital Road, Post Office More, Jalpaiguri'
  },
  {
    id: 'hosp-2',
    name: 'Desun Hospital & Medical Institute',
    distance: '4.5 km',
    openHours: 'Open 24 Hours',
    is24x7: true,
    hasEmergency: true,
    hasICU: true,
    hasBloodBank: true,
    hasAmbulance: true,
    departments: ['Advanced Cardiac Care', 'Neurology', 'Dialysis Centre', 'Orthopedics & Joint Replacement'],
    phone: '03561-255000',
    address: 'National Highway 31D Bypass, Jalpaiguri'
  },
  {
    id: 'hosp-3',
    name: 'Jalpaiguri Municipality Matri Sadan & Urban Primary Health Centre',
    distance: '2.1 km',
    openHours: '8:00 AM - 8:00 PM',
    is24x7: false,
    hasEmergency: false,
    hasICU: false,
    hasBloodBank: false,
    hasAmbulance: true,
    departments: ['Maternal Care', 'Child Immunization', 'General OPD', 'Diagnostic Lab'],
    phone: '03561-222400',
    address: 'Kadamtala Municipality Complex, Jalpaiguri'
  }
];
