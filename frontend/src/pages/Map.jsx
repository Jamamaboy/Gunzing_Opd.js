import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SvgMap from '../components/Map/SvgMap';
import LeafletMap from '../components/Map/LeafletMap';
import axios from 'axios';
import apiConfig from '../config/api';
import StatisticsPanel from '../components/Map/StatisticsPanel';
import { useDevice } from '../context/DeviceContext';

const mockEvidenceData = [
  { id: 1, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "โดเรม่อน", drug_type: "heroin", drug_category: "1", image_url: "", date: "2023-03-15", lat: 13.7563, lng: 100.5018, amount: 120000000, berat: "10,000 กก.", tambon: "บางรัก", amphoe: "บางรัก", province: "กรุงเทพมหานคร" },
  { id: 2, category: "ยาเสพติด", subcategory: "หีบห่อ", stamp: "ลิเวอร์พูล", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-11-02", lat: 13.7663, lng: 100.5118, amount: 45000, berat: "50 กก.", tambon: "ปทุมวัน", amphoe: "ปทุมวัน", province: "กรุงเทพมหานคร" },
  { id: 3, category: "ยาเสพติด", subcategory: "สารระเหย", stamp: "โฟล์ค", drug_type: "ketamine", drug_category: "3", image_url: "", date: "2021-05-20", lat: 13.7763, lng: 100.5218, amount: 1000000, berat: "100 กก.", tambon: "คลองเตย", amphoe: "คลองเตย", province: "กรุงเทพมหานคร" },
  { id: 4, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "มาเก๊า", drug_type: "heroin", drug_category: "1", image_url: "", date: "2020-09-10", lat: 18.7996, lng: 98.9737, amount: 45000, berat: "50 กก.", tambon: "ศรีภูมิ", amphoe: "เมืองเชียงใหม่", province: "เชียงใหม่" },
  { id: 5, category: "ยาเสพติด", subcategory: "ใบสด", stamp: "ธรรมชาติ", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2023-01-25", lat: 18.8096, lng: 98.9837, amount: 800, berat: "20 กก.", tambon: "ช้างเผือก", amphoe: "เมืองเชียงใหม่", province: "เชียงใหม่" },
  { id: 6, category: "ยาเสพติด", subcategory: "ใบแห้ง", stamp: "ขุนเขา", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2021-04-18", lat: 7.8804, lng: 98.3992, amount: 800, berat: "20 กก.", tambon: "รัษฎา", amphoe: "เมืองภูเก็ต", province: "ภูเก็ต" },
  { id: 7, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "เบียด", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-04-05", lat: 7.8904, lng: 98.4092, amount: 200, berat: "1 กก.", tambon: "ฉลอง", amphoe: "เมืองภูเก็ต", province: "ภูเก็ต" },
  { id: 8, category: "ยาเสพติด", subcategory: "ผง", stamp: "ขอนแก่น", drug_type: "ketamine", drug_category: "3", image_url: "", date: "2022-07-30", lat: 16.4351, lng: 102.8331, amount: 1000000, berat: "100 กก.", tambon: "ในเมือง", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 9, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "อีสาน", drug_type: "meth", drug_category: "2", image_url: "", date: "2020-12-12", lat: 16.4451, lng: 102.8431, amount: 200, berat: "1 กก.", tambon: "บ้านเป็ด", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 10, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ตรัง", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-03-08", lat: 8.6784, lng: 99.9622, amount: 200, berat: "1 กก.", tambon: "นาเหนือ", amphoe: "เมืองตรัง", province: "ตรัง" },
  { id: 11, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ใต้", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-06-14", lat: 8.6884, lng: 99.9722, amount: 150, berat: "0.8 กก.", tambon: "หาดใหญ่", amphoe: "เมืองตรัง", province: "ตรัง" },
  { id: 12, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "อีสานตอนบน", drug_type: "meth", drug_category: "2", image_url: "", date: "2021-02-22", lat: 15.1142, lng: 104.8752, amount: 50000, berat: "50 กก.", tambon: "ในเมือง", amphoe: "เมืองอุบลราชธานี", province: "อุบลราชธานี" },
  { id: 13, category: "ยาเสพติด", subcategory: "ผง", stamp: "อีสานใต้", drug_type: "heroin", drug_category: "1", image_url: "", date: "2020-11-05", lat: 15.1242, lng: 104.8852, amount: 30000, berat: "30 กก.", tambon: "แจระแม", amphoe: "เมืองอุบลราชธานี", province: "อุบลราชธานี" },
  { id: 14, category: "ยาเสพติด", subcategory: "ใบแห้ง", stamp: "ใต้ฝั่งตะวันออก", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2023-09-01", lat: 9.1388, lng: 99.3088, amount: 1000, berat: "10 กก.", tambon: "มะขามเตี้ย", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 15, category: "ยาเสพติด", subcategory: "สารระเหย", stamp: "ภาคใต้", drug_type: "ketamine", drug_category: "3", image_url: "", date: "2021-07-19", lat: 9.1488, lng: 99.3188, amount: 15000, berat: "15 กก.", tambon: "บางใบไม้", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 16, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "โคราช", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-08-11", lat: 14.9798, lng: 102.0976, amount: 800000, berat: "80 กก.", tambon: "ในเมือง", amphoe: "เมืองนครราชสีมา", province: "นครราชสีมา" },
  { id: 17, category: "ยาเสพติด", subcategory: "ผง", stamp: "อีสานกลาง", drug_type: "heroin", drug_category: "1", image_url: "", date: "2020-04-30", lat: 14.9898, lng: 102.1076, amount: 20000, berat: "20 กก.", tambon: "พลกรัง", amphoe: "เมืองนครราชสีมา", province: "นครราชสีมา" },
  { id: 18, category: "ยาเสพติด", subcategory: "ใบสด", stamp: "อีสานใต้", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2023-02-14", lat: 14.9998, lng: 102.1176, amount: 1200, berat: "12 กก.", tambon: "หนองไผ่ล้อม", amphoe: "เมืองนครราชสีมา", province: "นครราชสีมา" },
  { id: 19, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "พิษณุโลก", drug_type: "meth", drug_category: "2", image_url: "", date: "2021-10-09", lat: 16.8131, lng: 100.2648, amount: 90000, berat: "90 กก.", tambon: "ในเมือง", amphoe: "เมืองพิษณุโลก", province: "พิษณุโลก" },
  { id: 20, category: "ยาเสพติด", subcategory: "ผง", stamp: "เหนือ", drug_type: "heroin", drug_category: "1", image_url: "", date: "2022-12-25", lat: 16.8231, lng: 100.2748, amount: 30000, berat: "30 กก.", tambon: "ท่าทอง", amphoe: "เมืองพิษณุโลก", province: "พิษณุโลก" },
  { id: 21, category: "ยาเสพติด", subcategory: "ใบแห้ง", stamp: "ใต้ฝั่งตะวันออก", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2020-06-17", lat: 9.1388, lng: 99.3088, amount: 1000, berat: "10 กก.", tambon: "มะขามเตี้ย", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 22, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ทะเลใต้", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-01-01", lat: 9.1488, lng: 99.3188, amount: 500, berat: "5 กก.", tambon: "บางใบไม้", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 23, category: "ยาเสพติด", subcategory: "ผง", stamp: "น่าน", drug_type: "heroin", drug_category: "1", image_url: "", date: "2021-08-12", lat: 18.7889, lng: 100.7572, amount: 20000, berat: "20 กก.", tambon: "ในเวียง", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 24, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "น่านใต้", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-04-04", lat: 18.7989, lng: 100.7672, amount: 10000, berat: "10 กก.", tambon: "ไชยสถาน", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 25, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "แม่ฮ่องสอน", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-05-20", lat: 19.3132, lng: 97.9511, amount: 50000, berat: "50 กก.", tambon: "จองคำ", amphoe: "เมืองแม่ฮ่องสอน", province: "แม่ฮ่องสอน" },
  { id: 26, category: "ยาเสพติด", subcategory: "ผง", stamp: "แม่ฮ่องสอนเหนือ", drug_type: "heroin", drug_category: "1", image_url: "", date: "2021-03-14", lat: 19.3232, lng: 97.9611, amount: 15000, berat: "15 กก.", tambon: "ผาบ่อง", amphoe: "เมืองแม่ฮ่องสอน", province: "แม่ฮ่องสอน" },
  { id: 27, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ชลบุรี", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-11-03", lat: 13.3611, lng: 100.9842, amount: 30000, berat: "30 กก.", tambon: "แสนสุข", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 28, category: "ยาเสพติด", subcategory: "สารระเหย", stamp: "ชลบุรีใต้", drug_type: "ketamine", drug_category: "3", image_url: "", date: "2020-02-28", lat: 13.3711, lng: 100.9942, amount: 10000, berat: "10 กก.", tambon: "บางปลาสร้อย", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 29, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ยะลา", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-04-15", lat: 6.5606, lng: 101.2722, amount: 200000, berat: "200 กก.", tambon: "หน้าเมือง", amphoe: "เมืองยะลา", province: "ยะลา" },
  { id: 30, category: "ยาเสพติด", subcategory: "ผง", stamp: "ชายแดนใต้", drug_type: "heroin", drug_category: "1", image_url: "", date: "2022-09-10", lat: 6.5706, lng: 101.2822, amount: 10000, berat: "10 กก.", tambon: "สะเตง", amphoe: "เมืองยะลา", province: "ยะลา" },
  { id: 31, category: "อาวุธปืน", subcategory: "ปืนพก", mechanic: "กึ่งอัตโนมัติ", brand: "Glock", model: "19", image_url: "", date: "2023-03-10", lat: 13.7583, lng: 100.5038, amount: 15, tambon: "บางรัก", amphoe: "บางรัก", province: "กรุงเทพมหานคร" },
  { id: 32, category: "อาวุธปืน", subcategory: "ปืนไรเฟิล", mechanic: "กึ่งอัตโนมัติ", brand: "Colt", model: "M16", image_url: "", date: "2021-07-22", lat: 13.7683, lng: 100.5138, amount: 8, tambon: "ปทุมวัน", amphoe: "ปทุมวัน", province: "กรุงเทพมหานคร" },
  { id: 33, category: "อาวุธปืน", subcategory: "ปืนลูกซอง", mechanic: "Manual", brand: "Remington", model: "870", image_url: "", date: "2020-10-05", lat: 18.7916, lng: 98.9757, amount: 3, tambon: "ศรีภูมิ", amphoe: "เมืองเชียงใหม่", province: "เชียงใหม่" },
  { id: 34, category: "อาวุธปืน", subcategory: "ปืนยาว", mechanic: "Manual", brand: "Winchester", model: "70", image_url: "", date: "2022-05-12", lat: 7.8824, lng: 98.3972, amount: 10, tambon: "รัษฎา", amphoe: "เมืองภูเก็ต", province: "ภูเก็ต" },
  { id: 35, category: "อาวุธปืน", subcategory: "ปืนสั้น", mechanic: "กึ่งอัตโนมัติ", brand: "Beretta", model: "92F", image_url: "", date: "2021-01-01", lat: 16.4371, lng: 102.8351, amount: 5, tambon: "ในเมือง", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 36, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "อีสานใต้", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-02-18", lat: 14.9998, lng: 102.1176, amount: 1200, berat: "12 กก.", tambon: "หนองไผ่ล้อม", amphoe: "เมืองนครราชสีมา", province: "นครราชสีมา" },
  { id: 37, category: "ยาเสพติด", subcategory: "ใบแห้ง", stamp: "ใต้ฝั่งตะวันตก", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2021-09-07", lat: 9.1388, lng: 99.3088, amount: 1000, berat: "10 กก.", tambon: "มะขามเตี้ย", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 38, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ใต้ฝั่งตะวันออก", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-12-25", lat: 9.1488, lng: 99.3188, amount: 500, berat: "5 กก.", tambon: "บางใบไม้", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 39, category: "ยาเสพติด", subcategory: "ใบแห้ง", stamp: "ภาคเหนือ", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2020-03-15", lat: 18.7889, lng: 100.7572, amount: 20000, berat: "20 กก.", tambon: "ในเวียง", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 40, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "เหนือ", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-02-14", lat: 18.7989, lng: 100.7672, amount: 10000, berat: "10 กก.", tambon: "ไชยสถาน", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 41, category: "ยาเสพติด", subcategory: "สารระเหย", stamp: "ภาคใต้", drug_type: "ketamine", drug_category: "3", image_url: "", date: "2021-06-11", lat: 7.2184, lng: 100.6092, amount: 15000, berat: "15 กก.", tambon: "บ่อยาง", amphoe: "เมืองสงขลา", province: "สงขลา" },
  { id: 42, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคเหนือ", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-04-01", lat: 19.3132, lng: 97.9511, amount: 50000, berat: "50 กก.", tambon: "จองคำ", amphoe: "เมืองแม่ฮ่องสอน", province: "แม่ฮ่องสอน" },
  { id: 43, category: "ยาเสพติด", subcategory: "ผง", stamp: "ภาคเหนือ", drug_type: "heroin", drug_category: "1", image_url: "", date: "2020-05-20", lat: 19.3232, lng: 97.9611, amount: 15000, berat: "15 กก.", tambon: "ผาบ่อง", amphoe: "เมืองแม่ฮ่องสอน", province: "แม่ฮ่องสอน" },
  { id: 44, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคกลาง", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-11-11", lat: 13.3611, lng: 100.9842, amount: 30000, berat: "30 กก.", tambon: "แสนสุข", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 45, category: "ยาเสพติด", subcategory: "สารระเหย", stamp: "ภาคกลางใต้", drug_type: "ketamine", drug_category: "3", image_url: "", date: "2021-04-18", lat: 13.3711, lng: 100.9942, amount: 10000, berat: "10 กก.", tambon: "บางปลาสร้อย", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 46, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคใต้", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-03-22", lat: 6.5606, lng: 101.2722, amount: 200000, berat: "200 กก.", tambon: "หน้าเมือง", amphoe: "เมืองยะลา", province: "ยะลา" },
  { id: 47, category: "ยาเสพติด", subcategory: "ผง", stamp: "ภาคใต้", drug_type: "heroin", drug_category: "1", image_url: "", date: "2022-01-01", lat: 6.5706, lng: 101.2822, amount: 10000, berat: "10 กก.", tambon: "สะเตง", amphoe: "เมืองยะลา", province: "ยะลา" },
  { id: 48, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคตะวันออก", drug_type: "meth", drug_category: "2", image_url: "", date: "2021-09-19", lat: 13.3691, lng: 100.9862, amount: 30000, berat: "30 กก.", tambon: "บางปลาสร้อย", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 49, category: "ยาเสพติด", subcategory: "สารระเหย", stamp: "ภาคตะวันออก", drug_type: "ketamine", drug_category: "3", image_url: "", date: "2020-08-04", lat: 13.3711, lng: 100.9942, amount: 10000, berat: "10 กก.", tambon: "บางปลาสร้อย", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 50, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคเหนือตอนล่าง", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-01-15", lat: 16.4371, lng: 102.8351, amount: 90000, berat: "90 กก.", tambon: "ในเมือง", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 51, category: "ยาเสพติด", subcategory: "ผง", stamp: "ภาคอีสาน", drug_type: "heroin", drug_category: "1", image_url: "", date: "2022-12-25", lat: 16.4471, lng: 102.8451, amount: 20000, berat: "20 กก.", tambon: "บ้านเป็ด", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 52, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "อีสานใต้", drug_type: "meth", drug_category: "2", image_url: "", date: "2021-03-03", lat: 14.9998, lng: 102.1176, amount: 1200, berat: "12 กก.", tambon: "หนองไผ่ล้อม", amphoe: "เมืองนครราชสีมา", province: "นครราชสีมา" },
  { id: 53, category: "ยาเสพติด", subcategory: "ใบแห้ง", stamp: "ใต้ฝั่งตะวันตก", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2023-02-14", lat: 9.1388, lng: 99.3088, amount: 1000, berat: "10 กก.", tambon: "มะขามเตี้ย", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 54, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ใต้ฝั่งตะวันออก", drug_type: "meth", drug_category: "2", image_url: "", date: "2021-11-05", lat: 9.1488, lng: 99.3188, amount: 500, berat: "5 กก.", tambon: "บางใบไม้", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 55, category: "ยาเสพติด", subcategory: "ใบแห้ง", stamp: "ภาคเหนือ", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2020-07-17", lat: 18.7889, lng: 100.7572, amount: 20000, berat: "20 กก.", tambon: "ในเวียง", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 56, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "เหนือ", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-06-06", lat: 18.7989, lng: 100.7672, amount: 10000, berat: "10 กก.", tambon: "ไชยสถาน", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 57, category: "อาวุธปืน", subcategory: "ปืนพก", mechanic: "กึ่งอัตโนมัติ", brand: "Glock", model: "19", image_url: "", date: "2023-03-15", lat: 13.7583, lng: 100.5038, amount: 15, tambon: "บางรัก", amphoe: "บางรัก", province: "กรุงเทพมหานคร" },
  { id: 58, category: "อาวุธปืน", subcategory: "ปืนไรเฟิล", mechanic: "กึ่งอัตโนมัติ", brand: "Colt", model: "M16", image_url: "", date: "2021-04-10", lat: 13.7683, lng: 100.5138, amount: 8, tambon: "ปทุมวัน", amphoe: "ปทุมวัน", province: "กรุงเทพมหานคร" },
  { id: 59, category: "อาวุธปืน", subcategory: "ปืนลูกซอง", mechanic: "Manual", brand: "Remington", model: "870", image_url: "", date: "2020-12-25", lat: 18.7916, lng: 98.9757, amount: 3, tambon: "ศรีภูมิ", amphoe: "เมืองเชียงใหม่", province: "เชียงใหม่" },
  { id: 60, category: "อาวุธปืน", subcategory: "ปืนยาว", mechanic: "Manual", brand: "Winchester", model: "70", image_url: "", date: "2022-02-14", lat: 7.8824, lng: 98.3972, amount: 10, tambon: "รัษฎา", amphoe: "เมืองภูเก็ต", province: "ภูเก็ต" },
  { id: 61, category: "อาวุธปืน", subcategory: "ปืนสั้น", mechanic: "กึ่งอัตโนมัติ", brand: "Beretta", model: "92F", image_url: "", date: "2021-01-01", lat: 16.4371, lng: 102.8351, amount: 5, tambon: "ในเมือง", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 62, category: "อาวุธปืน", subcategory: "ปืนพก", mechanic: "Manual", brand: "Smith & Wesson", model: "M&P", image_url: "", date: "2023-04-05", lat: 8.6764, lng: 99.9642, amount: 12, tambon: "นาเหนือ", amphoe: "เมืองตรัง", province: "ตรัง" },
  { id: 63, category: "อาวุธปืน", subcategory: "ปืนไรเฟิล", mechanic: "กึ่งอัตโนมัติ", brand: "AK", model: "47", image_url: "", date: "2022-08-22", lat: 15.1162, lng: 104.8772, amount: 7, tambon: "ในเมือง", amphoe: "เมืองอุบลราชธานี", province: "อุบลราชธานี" },
  { id: 64, category: "อาวุธปืน", subcategory: "ปืนลูกซอง", mechanic: "Manual", brand: "Ithaca", model: "Model 37", image_url: "", date: "2020-11-11", lat: 7.2064, lng: 100.5972, amount: 4, tambon: "เขารูป", amphoe: "เมืองสงขลา", province: "สงขลา" },
  { id: 65, category: "อาวุธปืน", subcategory: "ปืนลูกซอง", mechanic: "Manual", brand: "Mossberg", model: "500", image_url: "", date: "2023-01-10", lat: 14.9778, lng: 102.0956, amount: 9, tambon: "ในเมือง", amphoe: "เมืองนครราชสีมา", province: "นครราชสีมา" },
  { id: 66, category: "อาวุธปืน", subcategory: "ปืนยาว", mechanic: "Manual", brand: "Springfield", model: "M1A", image_url: "", date: "2021-05-05", lat: 16.8151, lng: 100.2668, amount: 6, tambon: "ในเมือง", amphoe: "เมืองพิษณุโลก", province: "พิษณุโลก" },
  { id: 67, category: "อาวุธปืน", subcategory: "ปืนพก", mechanic: "กึ่งอัตโนมัติ", brand: "Sig Sauer", model: "P320", image_url: "", date: "2022-10-12", lat: 9.1368, lng: 99.3068, amount: 11, tambon: "มะขามเตี้ย", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 68, category: "อาวุธปืน", subcategory: "ปืนสั้น", mechanic: "กึ่งอัตโนมัติ", brand: "Walther", model: "PPQ", image_url: "", date: "2021-03-17", lat: 18.7869, lng: 100.7552, amount: 5, tambon: "ในเวียง", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 69, category: "อาวุธปืน", subcategory: "ปืนยาว", mechanic: "Manual", brand: "Ruger", model: "Mini-14", image_url: "", date: "2020-09-09", lat: 19.3152, lng: 97.9491, amount: 3, tambon: "จองคำ", amphoe: "เมืองแม่ฮ่องสอน", province: "แม่ฮ่องสอน" },
  { id: 70, category: "อาวุธปืน", subcategory: "ปืนพก", mechanic: "กึ่งอัตโนมัติ", brand: "CZ", model: "75", image_url: "", date: "2022-11-30", lat: 13.3591, lng: 100.9822, amount: 14, tambon: "แสนสุข", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 71, category: "อาวุธปืน", subcategory: "ปืนไรเฟิล", mechanic: "กึ่งอัตโนมัติ", brand: "FN", model: "FAL", image_url: "", date: "2023-02-14", lat: 6.5586, lng: 101.2702, amount: 10, tambon: "หน้าเมือง", amphoe: "เมืองยะลา", province: "ยะลา" },
  { id: 72, category: "อาวุธปืน", subcategory: "ปืนลูกซอง", mechanic: "Manual", brand: "Benelli", model: "M3", image_url: "", date: "2021-07-17", lat: 13.7783, lng: 100.5238, amount: 7, tambon: "คลองเตย", amphoe: "คลองเตย", province: "กรุงเทพมหานคร" },
  { id: 73, category: "อาวุธปืน", subcategory: "ปืนสั้น", mechanic: "กึ่งอัตโนมัติ", brand: "Heckler & Koch", model: "USP", image_url: "", date: "2022-04-01", lat: 18.8076, lng: 98.9857, amount: 6, tambon: "ช้างเผือก", amphoe: "เมืองเชียงใหม่", province: "เชียงใหม่" },
  { id: 74, category: "อาวุธปืน", subcategory: "ปืนยาว", mechanic: "Manual", brand: "Savage", model: "Axis", image_url: "", date: "2020-12-25", lat: 7.8924, lng: 98.4072, amount: 4, tambon: "ฉลอง", amphoe: "เมืองภูเก็ต", province: "ภูเก็ต" },
  { id: 75, category: "อาวุธปืน", subcategory: "ปืนพก", mechanic: "กึ่งอัตโนมัติ", brand: "Springfield", model: "XD", image_url: "", date: "2023-03-12", lat: 16.4471, lng: 102.8451, amount: 9, tambon: "บ้านเป็ด", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 76, category: "อาวุธปืน", subcategory: "ปืนไรเฟิล", mechanic: "กึ่งอัตโนมัติ", brand: "Bushmaster", model: "AR-15", image_url: "", date: "2022-09-09", lat: 8.6864, lng: 99.9742, amount: 13, tambon: "หาดใหญ่", amphoe: "เมืองตรัง", province: "ตรัง" },
  { id: 77, category: "อาวุธปืน", subcategory: "ปืนลูกซอง", mechanic: "Manual", brand: "Winchester", model: "1300", image_url: "", date: "2021-02-14", lat: 15.1262, lng: 104.8872, amount: 5, tambon: "แจระแม", amphoe: "เมืองอุบลราชธานี", province: "อุบลราชธานี" },
  { id: 78, category: "อาวุธปืน", subcategory: "ปืนสั้น", mechanic: "กึ่งอัตโนมัติ", brand: "Glock", model: "17", image_url: "", date: "2022-11-11", lat: 7.2164, lng: 100.6072, amount: 8, tambon: "บ่อยาง", amphoe: "เมืองสงขลา", province: "สงขลา" },
  { id: 79, category: "อาวุธปืน", subcategory: "ปืนพก", mechanic: "กึ่งอัตโนมัติ", brand: "CZ", model: "85", image_url: "", date: "2023-01-01", lat: 14.9878, lng: 102.1056, amount: 11, tambon: "พลกรัง", amphoe: "เมืองนครราชสีมา", province: "นครราชสีมา" },
  { id: 80, category: "อาวุธปืน", subcategory: "ปืนยาว", mechanic: "Manual", brand: "Weatherby", model: "Mark V", image_url: "", date: "2021-08-18", lat: 14.9978, lng: 102.1156, amount: 4, tambon: "หนองไผ่ล้อม", amphoe: "เมืองนครราชสีมา", province: "นครราชสีมา" },
  { id: 81, category: "อาวุธปืน", subcategory: "ปืนไรเฟิล", mechanic: "กึ่งอัตโนมัติ", brand: "DPMS", model: "Panther", image_url: "", date: "2022-06-06", lat: 16.8251, lng: 100.2768, amount: 7, tambon: "ท่าทอง", amphoe: "เมืองพิษณุโลก", province: "พิษณุโลก" },
  { id: 82, category: "อาวุธปืน", subcategory: "ปืนลูกซอง", mechanic: "Manual", brand: "Browning", model: "Citori", image_url: "", date: "2020-01-01", lat: 18.7969, lng: 100.7652, amount: 6, tambon: "ไชยสถาน", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 83, category: "อาวุธปืน", subcategory: "ปืนสั้น", mechanic: "กึ่งอัตโนมัติ", brand: "Tanfoglio", model: "T95", image_url: "", date: "2023-02-14", lat: 19.3252, lng: 97.9591, amount: 3, tambon: "ผาบ่อง", amphoe: "เมืองแม่ฮ่องสอน", province: "แม่ฮ่องสอน" },
  { id: 84, category: "อาวุธปืน", subcategory: "ปืนพก", mechanic: "กึ่งอัตโนมัติ", brand: "STI", model: "Edge", image_url: "", date: "2022-12-12", lat: 13.3691, lng: 100.9862, amount: 12, tambon: "บางปลาสร้อย", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 85, category: "อาวุธปืน", subcategory: "ปืนยาว", mechanic: "Manual", brand: "Marlin", model: "336", image_url: "", date: "2021-04-04", lat: 6.5686, lng: 101.2742, amount: 9, tambon: "สะเตง", amphoe: "เมืองยะลา", province: "ยะลา" },
  { id: 86, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "อีสานใต้", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-04-15", lat: 14.9998, lng: 102.1176, amount: 1200, berat: "12 กก.", tambon: "หนองไผ่ล้อม", amphoe: "เมืองนครราชสีมา", province: "นครราชสีมา" },
  { id: 87, category: "ยาเสพติด", subcategory: "ใบแห้ง", stamp: "ใต้ฝั่งตะวันตก", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2021-05-19", lat: 9.1388, lng: 99.3088, amount: 1000, berat: "10 กก.", tambon: "มะขามเตี้ย", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 88, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ใต้ฝั่งตะวันออก", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-07-11", lat: 9.1488, lng: 99.3188, amount: 500, berat: "5 กก.", tambon: "บางใบไม้", amphoe: "เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
  { id: 89, category: "ยาเสพติด", subcategory: "ใบแห้ง", stamp: "ภาคเหนือ", drug_type: "cannabis", drug_category: "4", image_url: "", date: "2020-02-14", lat: 18.7889, lng: 100.7572, amount: 20000, berat: "20 กก.", tambon: "ในเวียง", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 90, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "เหนือ", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-10-25", lat: 18.7989, lng: 100.7672, amount: 10000, berat: "10 กก.", tambon: "ไชยสถาน", amphoe: "เมืองน่าน", province: "น่าน" },
  { id: 91, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคเหนือตอนล่าง", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-01-01", lat: 16.4371, lng: 102.8351, amount: 90000, berat: "90 กก.", tambon: "ในเมือง", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 92, category: "ยาเสพติด", subcategory: "ผง", stamp: "ภาคอีสาน", drug_type: "heroin", drug_category: "1", image_url: "", date: "2021-09-19", lat: 16.4471, lng: 102.8451, amount: 20000, berat: "20 กก.", tambon: "บ้านเป็ด", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 93, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคกลาง", drug_type: "meth", drug_category: "2", image_url: "", date: "2022-08-08", lat: 13.3611, lng: 100.9842, amount: 30000, berat: "30 กก.", tambon: "แสนสุข", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 94, category: "ยาเสพติด", subcategory: "สารระเหย", stamp: "ภาคกลางใต้", drug_type: "ketamine", drug_category: "3", image_url: "", date: "2020-12-25", lat: 13.3711, lng: 100.9942, amount: 10000, berat: "10 กก.", tambon: "บางปลาสร้อย", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 95, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคใต้", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-03-15", lat: 6.5606, lng: 101.2722, amount: 200000, berat: "200 กก.", tambon: "หน้าเมือง", amphoe: "เมืองยะลา", province: "ยะลา" },
  { id: 96, category: "ยาเสพติด", subcategory: "ผง", stamp: "ภาคใต้", drug_type: "heroin", drug_category: "1", image_url: "", date: "2022-02-14", lat: 6.5706, lng: 101.2822, amount: 10000, berat: "10 กก.", tambon: "สะเตง", amphoe: "เมืองยะลา", province: "ยะลา" },
  { id: 97, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคตะวันออก", drug_type: "meth", drug_category: "2", image_url: "", date: "2021-09-09", lat: 13.3691, lng: 100.9862, amount: 30000, berat: "30 กก.", tambon: "บางปลาสร้อย", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 98, category: "ยาเสพติด", subcategory: "สารระเหย", stamp: "ภาคตะวันออก", drug_type: "ketamine", drug_category: "3", image_url: "", date: "2020-06-18", lat: 13.3711, lng: 100.9942, amount: 10000, berat: "10 กก.", tambon: "บางปลาสร้อย", amphoe: "เมืองชลบุรี", province: "ชลบุรี" },
  { id: 99, category: "ยาเสพติด", subcategory: "เม็ด", stamp: "ภาคเหนือตอนล่าง", drug_type: "meth", drug_category: "2", image_url: "", date: "2023-04-01", lat: 16.4371, lng: 102.8351, amount: 90000, berat: "90 กก.", tambon: "ในเมือง", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" },
  { id: 100, category: "ยาเสพติด", subcategory: "ผง", stamp: "ภาคอีสาน", drug_type: "heroin", drug_category: "1", image_url: "", date: "2022-11-11", lat: 16.4471, lng: 102.8451, amount: 20000, berat: "20 กก.", tambon: "บ้านเป็ด", amphoe: "เมืองขอนแก่น", province: "ขอนแก่น" }
];

const mainCategories = {
  all: 'ทั้งหมด',
  drugs: 'ยาเสพติด',
  guns: 'อาวุธปืน',
};

// --- Desktop Layout Component ---
const DesktopLayout = ({
  mapView, setMapView, viewMode, setViewMode, selectedAreas, showElements,
  showFilter, setShowFilter,
  showEvidenceFilterPanel, setShowEvidenceFilterPanel, evidenceFilterOptions, activeEvidenceFilters, handleMainCategoryChange, handleEvidenceSubFilterToggle,
  provinces, districts, subdistricts, loading, searchTerm, setSearchTerm,
  selectedProvinces, selectedDistricts, selectedSubdistricts, expandedProvinces, expandedDistricts,
  visibleLevels, provinceData,
  handleSelectionChange, handleProvinceClick, handleDistrictSelect, handleSubdistrictSelect,
  clearProvinceSelection, clearDistrictSelection, clearSubdistrictSelection,
  toggleFilter, toggleProvinceExpansion, toggleDistrictExpansion, toggleVisibleLevel,
  getFilteredData, leafletMapFilters,
}) => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex h-full min-h-[600px] sm:h-[calc(100vh-64px)]">
        {/* Main Content (Map) */}
        <div className="flex-grow relative">
          {/* --- Controls & Overlays --- */}
          <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md"> {/* Map View Toggle */}
             <div className="flex p-1">
              <button className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mapView === 'leaflet' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setMapView('leaflet')}>แผนที่เชิงภูมิศาสตร์</button>
              <button className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mapView === 'svg' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setMapView('svg')}>แผนที่แผนภาพ</button>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-md"> {/* View Mode Toggle */}
            <div className="flex p-1">
              <button className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'markers' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setViewMode('markers')}>Markers</button>
              <button className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'heatmap' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`} onClick={() => setViewMode('heatmap')}>Heatmap</button>
            </div>
          </div>
          <div className="absolute top-16 left-4 bg-white bg-opacity-90 px-4 py-2 rounded-md shadow-md z-20"> {/* Detail Level Selector */}
            <span className="mr-4 font-medium text-sm">ระดับแสดงผล:</span>
            <label className="inline-flex items-center mr-4 text-sm cursor-pointer"> <input type="checkbox" checked={visibleLevels.province} onChange={() => toggleVisibleLevel('province')} className="mr-1 form-checkbox h-4 w-4 text-blue-600 rounded"/><span>จังหวัด</span></label>
            <label className="inline-flex items-center mr-4 text-sm cursor-pointer"><input type="checkbox" checked={visibleLevels.district} onChange={() => toggleVisibleLevel('district')} className="mr-1 form-checkbox h-4 w-4 text-blue-600 rounded" disabled={!districts || districts.length === 0}/><span>อำเภอ</span></label>
            <label className="inline-flex items-center text-sm cursor-pointer"><input type="checkbox" checked={visibleLevels.subdistrict} onChange={() => toggleVisibleLevel('subdistrict')} className="mr-1 form-checkbox h-4 w-4 text-blue-600 rounded" disabled={!subdistricts || subdistricts.length === 0}/><span>ตำบล</span></label>
          </div>
          <div className="absolute top-4 right-4 flex space-x-2 z-20"> {/* Filter Buttons */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md text-sm hover:bg-blue-700 transition-colors" onClick={toggleFilter}>{showFilter ? "ซ่อนตัวกรองพื้นที่" : "ตัวกรองพื้นที่"}</button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-md shadow-md text-sm hover:bg-purple-700 transition-colors" onClick={() => setShowEvidenceFilterPanel(prev => !prev)}>{showEvidenceFilterPanel ? "ซ่อนตัวกรองวัตถุพยาน" : "ตัวกรองวัตถุพยาน"}</button>
          </div>
          <div className="absolute top-28 left-4 bg-white bg-opacity-85 p-3 rounded-md shadow-lg z-20 max-w-xs text-xs flex flex-col gap-y-3"> {/* Selected Location Panel */}
            {selectedProvinces.length === 0 && selectedDistricts.length === 0 && selectedSubdistricts.length === 0 && (<p className="text-gray-500 italic">ไม่มีรายการที่เลือก</p>)}
             {selectedProvinces.length > 0 && (
                 <div>
                    <h2 className="text-sm font-semibold mb-1.5 flex justify-between items-center"><span>จังหวัดที่เลือก ({selectedProvinces.length})</span><button className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-0.5 rounded text-[10px] ml-2" onClick={clearProvinceSelection} title="ล้างจังหวัดที่เลือกทั้งหมด">ล้างหมด</button></h2>
                    <div className="max-h-20 overflow-y-auto border rounded p-1.5 space-y-1">
                        {selectedProvinces.map(province => (<div key={province.id} className="flex justify-between items-center bg-gray-50 px-1 py-0.5 rounded"><span className="truncate mr-1">{province.province_name}</span><button className="text-red-500 hover:text-red-700 text-xs font-bold" onClick={() => handleProvinceClick(province)} title={`ลบ ${province.province_name}`}>✕</button></div>))}
                    </div>
                </div>
             )}
             {selectedDistricts.length > 0 && (
                 <div>
                    <h2 className="text-sm font-semibold mb-1.5 flex justify-between items-center"><span>อำเภอที่เลือก ({selectedDistricts.length})</span><button className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-0.5 rounded text-[10px]" onClick={clearDistrictSelection} title="ล้างอำเภอที่เลือกทั้งหมด">ล้างหมด</button></h2>
                    <div className="max-h-20 overflow-y-auto border rounded p-1.5 space-y-1">
                        {selectedDistricts.map(district => {
                            const provinceName = provinces.find(p => p.id === district.province_id)?.province_name;
                            const displayName = district.district_name || district.amphoe_t || `ID: ${district.id}`;
                            return (<div key={district.id} className="flex justify-between items-center bg-gray-50 px-1 py-0.5 rounded"><span className="truncate mr-1" title={`${displayName}${provinceName ? ` (${provinceName})` : ''}`}>{displayName}{provinceName && <span className="text-gray-500 text-[10px]"> ({provinceName})</span>}</span><button className="text-red-500 hover:text-red-700 text-xs font-bold" onClick={() => handleDistrictSelect(district, true)} title={`ลบ ${displayName}`}>✕</button></div>);
                        })}
                    </div>
                </div>
             )}
             {selectedSubdistricts.length > 0 && (
                <div>
                   <h2 className="text-sm font-semibold mb-1.5 flex justify-between items-center"><span>ตำบลที่เลือก ({selectedSubdistricts.length})</span><button className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-0.5 rounded text-[10px]" onClick={clearSubdistrictSelection} title="ล้างตำบลที่เลือกทั้งหมด">ล้างหมด</button></h2>
                   <div className="max-h-20 overflow-y-auto border rounded p-1.5 space-y-1">
                       {selectedSubdistricts.map(subdistrict => {
                           const districtObj = districts.find(d => d.id === subdistrict.district_id);
                           const districtName = districtObj?.district_name || districtObj?.amphoe_t || '';
                           const displayName = subdistrict.subdistrict_name || subdistrict.tambon_t || `ID: ${subdistrict.id}`;
                           return (<div key={subdistrict.id} className="flex justify-between items-center bg-gray-50 px-1 py-0.5 rounded"><span className="truncate mr-1" title={`${displayName}${districtName ? ` (${districtName})` : ''}`}>{displayName}{districtName && <span className="text-gray-500 text-[10px]"> ({districtName})</span>}</span><button className="text-red-500 hover:text-red-700 text-xs font-bold" onClick={() => handleSubdistrictSelect(subdistrict, true)} title={`ลบ ${displayName}`}>✕</button></div>);
                       })}
                   </div>
                </div>
             )}
          </div>
          <div className="absolute top-16 right-4 bg-white bg-opacity-85 p-3 rounded-md shadow-lg z-20 text-xs"> {/* Map Legend */}
            <h3 className="font-semibold mb-2">คำอธิบายแผนที่</h3>
            <div className="space-y-2">
              {visibleLevels.province && (<div className="flex items-center"><div className="w-4 h-4 bg-blue-300 mr-2 rounded"></div><span>จังหวัดที่เลือก</span></div>)}
              {visibleLevels.district && (<div className="flex items-center"><div className="w-4 h-4 bg-orange-200 mr-2 rounded" style={{opacity: 0.6}}></div><span>อำเภอที่เลือก</span></div>)}
              {visibleLevels.subdistrict && (<div className="flex items-center"><div className="w-4 h-4 bg-green-200 mr-2 rounded" style={{opacity: 0.6}}></div><span>ตำบลที่เลือก</span></div>)}
            </div>
          </div>

          {/* --- Map Components --- */}
          <div className="relative w-full h-full">
            <div style={{ position: 'absolute', inset: 0, display: mapView === 'leaflet' ? 'block' : 'none', zIndex: mapView === 'leaflet' ? 1 : 0 }}>
              <LeafletMap
                selectedProvinces={selectedProvinces}
                selectedDistricts={selectedDistricts}
                selectedSubdistricts={selectedSubdistricts}
                visibleLevels={visibleLevels}
                onProvinceClick={handleProvinceClick}
                onDistrictSelect={handleDistrictSelect}
                onSubdistrictSelect={handleSubdistrictSelect}
                filters={leafletMapFilters} // Simple filters for heatmap/aggregation
                detailedFilters={activeEvidenceFilters} // Detailed filters for marker rendering
                showElements={showElements}
                viewMode={viewMode}
                evidenceData={mockEvidenceData}
              />
            </div>
            <div style={{ position: 'absolute', inset: 0, display: mapView === 'svg' ? 'block' : 'none', zIndex: mapView === 'svg' ? 1 : 0 }}>
              <SvgMap
                selectedProvinces={selectedProvinces}
                selectedDistricts={selectedDistricts}
                selectedSubdistricts={selectedSubdistricts}
                visibleLevels={visibleLevels}
                onProvinceClick={handleProvinceClick}
                onDistrictSelect={handleDistrictSelect}
                onSubdistrictSelect={handleSubdistrictSelect}
                onSelectionChange={handleSelectionChange}
                filters={leafletMapFilters} // SvgMap might need adaptation for detailed filters
                showElements={showElements}
                viewMode={viewMode}
                evidenceData={mockEvidenceData}
              />
            </div>
          </div>

          {/* --- Filter Modals --- */}
          {showFilter && ( /* Location Filter Modal */
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
               <div className="bg-white rounded-lg shadow-xl p-4 w-96 max-h-[80vh] max-w-lg overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">ตัวเลือกพื้นที่</h2><button className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-sm" onClick={toggleFilter}>ปิด</button></div>
                <div className="mb-4"><input type="text" placeholder="ค้นหาจังหวัด อำเภอ หรือตำบล..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
                <div className="flex justify-between mb-4 gap-x-2"><button className="flex-1 bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50" onClick={clearProvinceSelection} disabled={selectedProvinces.length === 0 && selectedDistricts.length === 0 && selectedSubdistricts.length === 0}>ล้างที่เลือกทั้งหมด</button><button className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors" onClick={() => { setVisibleLevels({ province: true, district: selectedDistricts.length > 0 || selectedSubdistricts.length > 0, subdistrict: selectedSubdistricts.length > 0 }); setShowFilter(false); }}>ดูที่เลือกบนแผนที่</button></div>
                <div className="overflow-y-auto flex-grow border rounded">
                  {loading ? (<p className="text-gray-500 text-sm p-3 text-center">กำลังโหลดข้อมูล...</p>) : getFilteredData().length === 0 ? (<p className="text-gray-500 text-sm p-3 text-center">ไม่พบข้อมูลที่ค้นหา</p>) : (
                    <ul className="divide-y divide-gray-200">
                      {getFilteredData().map(({ province, districts: provinceDistricts }) => { const isProvSelected = selectedProvinces.some(p => p.id === province.id); const isProvinceExpanded = expandedProvinces[province.id] || searchTerm.trim() !== ''; return (<li key={province.id} className="border-b last:border-b-0"><div className="flex items-center px-3 py-2 bg-gray-50"><button onClick={() => toggleProvinceExpansion(province.id)} className="mr-2 text-gray-700 hover:text-blue-600">{isProvinceExpanded ? '▾' : '▸'}</button><div className="flex items-center flex-grow"><label className="flex items-center cursor-pointer"><input type="checkbox" checked={isProvSelected} onChange={() => handleProvinceClick(province)} className="h-4 w-4 text-blue-600 rounded form-checkbox"/><span className="ml-2 text-sm">{province.province_name}</span></label></div></div>{isProvinceExpanded && provinceDistricts && provinceDistricts.length > 0 && provinceDistricts.map(district => { const isDistrictExpanded = expandedDistricts[district.id]; const isSelected = selectedDistricts.some(d => d.id === district.id); return (<div key={district.id}><div className="flex items-center pl-8 pr-3 py-1 bg-gray-100"><button onClick={() => toggleDistrictExpansion(district.id)} className="mr-2 text-gray-700 hover:text-blue-600">{isDistrictExpanded ? '▾' : '▸'}</button><div className="flex items-center flex-grow"><label className="flex items-center cursor-pointer"><input type="checkbox" checked={isSelected} onChange={() => handleDistrictSelect(district, isSelected)} className="h-3 w-3 text-orange-500 rounded form-checkbox"/><span className="ml-1 text-xs">{district.district_name || district.amphoe_t || `ID: ${district.id}`}</span></label></div></div>{isDistrictExpanded && district.subdistricts && district.subdistricts.length > 0 && (<div className="pl-10 pr-3 py-2 bg-gray-50 flex flex-wrap gap-2">{district.subdistricts.map(subdistrict => { const isSelected = selectedSubdistricts.some(sd => sd.id === subdistrict.id); const displayName = subdistrict.subdistrict_name || subdistrict.tambon_t || `ID: ${subdistrict.id}`; return (<label key={subdistrict.id} className={`inline-flex items-center cursor-pointer px-2 py-1 rounded text-xs ${isSelected ? 'bg-green-100 border border-green-300' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'}`}><input type="checkbox" checked={isSelected} onChange={() => handleSubdistrictSelect(subdistrict, isSelected)} className="h-3 w-3 text-green-500 rounded form-checkbox"/><span className="ml-1 truncate" title={displayName}>{displayName}</span></label>);})}</div>)}</div>);})}</li>);})}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {showEvidenceFilterPanel && ( /* Evidence Filter Modal */
             <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-xl p-4 w-96 max-h-[80vh] max-w-lg overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">ตัวกรองวัตถุพยาน</h2><button className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1 rounded text-sm" onClick={() => setShowEvidenceFilterPanel(false)}>ปิด</button></div>
                <div className="mb-4 border-b pb-3"><p className="text-sm font-medium mb-2">เลือกประเภทหลัก:</p><div className="flex space-x-2">{Object.entries(mainCategories).map(([key, name]) => (<button key={key} onClick={() => handleMainCategoryChange(key)} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${activeEvidenceFilters.activeMainCategory === key ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{name}</button>))}</div></div>
                <div className="overflow-y-auto flex-grow space-y-3 text-sm">
                  {(activeEvidenceFilters.activeMainCategory === 'all' || activeEvidenceFilters.activeMainCategory === 'drugs') && (
                    <div className="p-2 border rounded"><h3 className="text-sm font-semibold mb-2 text-purple-800">ตัวกรองยาเสพติด</h3>
                      {Object.keys(evidenceFilterOptions.drugSubcategories || {}).length > 0 && <div className="mb-2 pt-1"><p className="font-medium text-xs mb-1">ลักษณะ:</p><div className="grid grid-cols-2 gap-1">{Object.entries(evidenceFilterOptions.drugSubcategories).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.drugSubcategories[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('drugSubcategory', key)} className="form-checkbox h-3.5 w-3.5 text-purple-500 rounded mr-1"/><span className="text-xs">{name}</span></label>))}</div></div>}
                      {Object.keys(evidenceFilterOptions.drugStamps || {}).length > 0 && <div className="mb-2 border-t pt-2"><p className="font-medium text-xs mb-1">ตราประทับ:</p><div className="grid grid-cols-2 gap-1">{Object.entries(evidenceFilterOptions.drugStamps).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.drugStamps[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('drugStamp', key)} className="form-checkbox h-3.5 w-3.5 text-purple-500 rounded mr-1"/><span className="text-xs">{name || '(ไม่ระบุ)'}</span></label>))}</div></div>}
                      {Object.keys(evidenceFilterOptions.drugTypes || {}).length > 0 && <div className="mb-2 border-t pt-2"><p className="font-medium text-xs mb-1">ประเภทสาร:</p><div className="grid grid-cols-2 gap-1">{Object.entries(evidenceFilterOptions.drugTypes).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.drugTypes[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('drugType', key)} className="form-checkbox h-3.5 w-3.5 text-purple-500 rounded mr-1"/><span className="text-xs">{name}</span></label>))}</div></div>}
                      {Object.keys(evidenceFilterOptions.drugCategories || {}).length > 0 && <div className="border-t pt-2"><p className="font-medium text-xs mb-1">ประเภทตามกฎหมาย:</p><div className="grid grid-cols-2 gap-1">{Object.entries(evidenceFilterOptions.drugCategories).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.drugCategories[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('drugCategory', key)} className="form-checkbox h-3.5 w-3.5 text-purple-500 rounded mr-1"/><span className="text-xs">ประเภท {name}</span></label>))}</div></div>}
                    </div>
                  )}
                  {(activeEvidenceFilters.activeMainCategory === 'all' || activeEvidenceFilters.activeMainCategory === 'guns') && (
                    <div className="p-2 border rounded"><h3 className="text-sm font-semibold mb-2 text-indigo-800">ตัวกรองอาวุธปืน</h3>
                      {Object.keys(evidenceFilterOptions.gunSubcategories || {}).length > 0 && <div className="mb-2 pt-1"><p className="font-medium text-xs mb-1">ประเภทปืน:</p><div className="grid grid-cols-2 gap-1">{Object.entries(evidenceFilterOptions.gunSubcategories).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.gunSubcategories[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('gunSubcategory', key)} className="form-checkbox h-3.5 w-3.5 text-indigo-500 rounded mr-1"/><span className="text-xs">{name}</span></label>))}</div></div>}
                      {Object.keys(evidenceFilterOptions.gunMechanics || {}).length > 0 && <div className="mb-2 border-t pt-2"><p className="font-medium text-xs mb-1">กลไก:</p><div className="grid grid-cols-2 gap-1">{Object.entries(evidenceFilterOptions.gunMechanics).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.gunMechanics[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('gunMechanic', key)} className="form-checkbox h-3.5 w-3.5 text-indigo-500 rounded mr-1"/><span className="text-xs">{name}</span></label>))}</div></div>}
                      {Object.keys(evidenceFilterOptions.gunBrands || {}).length > 0 && <div className="mb-2 border-t pt-2"><p className="font-medium text-xs mb-1">ยี่ห้อ:</p><div className="grid grid-cols-2 gap-1">{Object.entries(evidenceFilterOptions.gunBrands).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.gunBrands[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('gunBrand', key)} className="form-checkbox h-3.5 w-3.5 text-indigo-500 rounded mr-1"/><span className="text-xs">{name}</span></label>))}</div></div>}
                      {Object.keys(evidenceFilterOptions.gunModels || {}).length > 0 && <div className="border-t pt-2"><p className="font-medium text-xs mb-1">รุ่น:</p><div className="grid grid-cols-2 gap-1">{Object.entries(evidenceFilterOptions.gunModels).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.gunModels[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('gunModel', key)} className="form-checkbox h-3.5 w-3.5 text-indigo-500 rounded mr-1"/><span className="text-xs">{name}</span></label>))}</div></div>}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t">
                    <button onClick={() => setShowEvidenceFilterPanel(false)} className="w-full bg-purple-600 text-white py-2 rounded-md text-sm hover:bg-purple-700">ใช้ตัวกรอง</button>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Statistics Panel */}
        <div className="w-64 bg-white border-l border-gray-300 shadow-lg overflow-y-auto">
          <StatisticsPanel
            selectedAreas={selectedAreas}
            provinceData={provinceData}
            isVisible={true}
            activeLeafletFilters={leafletMapFilters} // Simple filters
            detailedFilters={activeEvidenceFilters} // Detailed filters
            mockEvidenceData={mockEvidenceData}
            activeMainCategoryFilter={activeEvidenceFilters.activeMainCategory}
          />
        </div>
      </div>
    </div>
  );
};

// --- Mobile Layout Component ---
const MobileLayout = ({
  mapView, setMapView, viewMode, setViewMode, selectedAreas, showElements,
  showFilter, setShowFilter,
  showEvidenceFilterPanel, setShowEvidenceFilterPanel, evidenceFilterOptions, activeEvidenceFilters, handleMainCategoryChange, handleEvidenceSubFilterToggle,
  provinces, districts, subdistricts, loading, searchTerm, setSearchTerm,
  selectedProvinces, selectedDistricts, selectedSubdistricts, expandedProvinces, expandedDistricts,
  visibleLevels, provinceData,
  handleSelectionChange, handleProvinceClick, handleDistrictSelect, handleSubdistrictSelect,
  clearProvinceSelection, clearDistrictSelection, clearSubdistrictSelection,
  toggleFilter, toggleProvinceExpansion, toggleDistrictExpansion, toggleVisibleLevel,
  getFilteredData, leafletMapFilters,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  // Content for Location Filter Modal (reused from Desktop, ensure styling is mobile-friendly if needed)
  const LocationFilterModalContent = () => (
    <>
      <div className="flex justify-between items-center mb-4 p-4 border-b">
        <h2 className="text-lg font-semibold">ตัวเลือกพื้นที่</h2>
        <button className="text-gray-500" onClick={toggleFilter} aria-label="Close location filter">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div className="p-4">
        <input 
          type="text" 
          placeholder="ค้นหาจังหวัด อำเภอ หรือตำบล..." 
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none mb-3" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex justify-between mb-3 gap-x-2">
          <button 
            className="flex-1 bg-red-500 text-white px-2 py-1.5 rounded text-xs hover:bg-red-600 transition-colors disabled:opacity-50" 
            onClick={clearProvinceSelection} 
            disabled={selectedProvinces.length === 0 && selectedDistricts.length === 0 && selectedSubdistricts.length === 0}
          >
            ล้างที่เลือกทั้งหมด
          </button>
          <button 
            className="flex-1 bg-green-500 text-white px-2 py-1.5 rounded text-xs hover:bg-green-600 transition-colors" 
            onClick={() => { 
              setVisibleLevels({ 
                province: true, 
                district: selectedDistricts.length > 0 || selectedSubdistricts.length > 0, 
                subdistrict: selectedSubdistricts.length > 0 
              }); 
              setShowFilter(false); 
            }}
          >
            ดูที่เลือกบนแผนที่
          </button>
        </div>
      </div>
      <div className="overflow-y-auto flex-grow border-t p-2">
        {loading ? (<p className="text-gray-500 text-sm p-3 text-center">กำลังโหลดข้อมูล...</p>) : 
         getFilteredData().length === 0 ? (<p className="text-gray-500 text-sm p-3 text-center">ไม่พบข้อมูลที่ค้นหา</p>) : (
          <ul className="divide-y divide-gray-200">
            {getFilteredData().map(({ province, districts: provinceDistricts }) => { 
              const isProvSelected = selectedProvinces.some(p => p.id === province.id); 
              const isProvinceExpanded = expandedProvinces[province.id] || searchTerm.trim() !== ''; 
              return (
                <li key={province.id} className="border-b last:border-b-0">
                  <div className="flex items-center px-2 py-2 bg-gray-50">
                    <button onClick={() => toggleProvinceExpansion(province.id)} className="mr-2 text-gray-700 hover:text-blue-600 text-lg">
                      {isProvinceExpanded ? '▾' : '▸'}
                    </button>
                    <div className="flex items-center flex-grow">
                      <label className="flex items-center cursor-pointer w-full">
                        <input 
                          type="checkbox" 
                          checked={isProvSelected} 
                          onChange={() => handleProvinceClick(province)} 
                          className="h-4 w-4 text-blue-600 rounded form-checkbox"
                        />
                        <span className="ml-2 text-sm">{province.province_name}</span>
                      </label>
                    </div>
                  </div>
                  {isProvinceExpanded && provinceDistricts && provinceDistricts.length > 0 && provinceDistricts.map(district => { 
                    const isDistrictExpanded = expandedDistricts[district.id]; 
                    const isSelected = selectedDistricts.some(d => d.id === district.id); 
                    return (
                      <div key={district.id}>
                        <div className="flex items-center pl-6 pr-2 py-1.5 bg-gray-100">
                          <button onClick={() => toggleDistrictExpansion(district.id)} className="mr-2 text-gray-700 hover:text-blue-600 text-base">
                            {isDistrictExpanded ? '▾' : '▸'}
                          </button>
                          <div className="flex items-center flex-grow">
                            <label className="flex items-center cursor-pointer w-full">
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => handleDistrictSelect(district, isSelected)} 
                                className="h-3.5 w-3.5 text-orange-500 rounded form-checkbox"
                              />
                              <span className="ml-1.5 text-xs">{district.district_name || district.amphoe_t || `ID: ${district.id}`}</span>
                            </label>
                          </div>
                        </div>
                        {isDistrictExpanded && district.subdistricts && district.subdistricts.length > 0 && (
                          <div className="pl-10 pr-2 py-2 bg-gray-50 space-y-1">
                            {district.subdistricts.map(subdistrict => { 
                              const isSubdSelected = selectedSubdistricts.some(sd => sd.id === subdistrict.id); 
                              const displayName = subdistrict.subdistrict_name || subdistrict.tambon_t || `ID: ${subdistrict.id}`; 
                              return (
                                <label key={subdistrict.id} className={`flex items-center cursor-pointer px-2 py-1 rounded text-xs ${isSubdSelected ? 'bg-green-100 border border-green-300' : 'bg-white border border-gray-200 hover:bg-gray-100'}`}>
                                  <input 
                                    type="checkbox" 
                                    checked={isSubdSelected} 
                                    onChange={() => handleSubdistrictSelect(subdistrict, isSubdSelected)} 
                                    className="h-3.5 w-3.5 text-green-500 rounded form-checkbox"
                                  />
                                  <span className="ml-1.5 truncate" title={displayName}>{displayName}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );


  const ControlsPanelContent = () => (
    <div className="p-4 space-y-4">
        <div>
            <h3 className="text-sm font-semibold mb-2">Map View</h3>
            <div className="flex space-x-2">
                <button className={`flex-1 px-3 py-1.5 text-xs rounded-md ${mapView === 'leaflet' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => { setMapView('leaflet'); setShowControls(false); }}>ภูมิศาสตร์</button>
                <button className={`flex-1 px-3 py-1.5 text-xs rounded-md ${mapView === 'svg' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => { setMapView('svg'); setShowControls(false); }}>แผนภาพ</button>
            </div>
        </div>
        <div>
            <h3 className="text-sm font-semibold mb-2">View Mode</h3>
            <div className="flex space-x-2">
                <button className={`flex-1 px-3 py-1.5 text-xs rounded-md ${viewMode === 'markers' ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => { setViewMode('markers'); setShowControls(false); }}>Markers</button>
                <button className={`flex-1 px-3 py-1.5 text-xs rounded-md ${viewMode === 'heatmap' ? 'bg-green-600 text-white' : 'bg-gray-200'}`} onClick={() => { setViewMode('heatmap'); setShowControls(false); }}>Heatmap</button>
            </div>
        </div>
        <div>
            <h3 className="text-sm font-semibold mb-2">ระดับแสดงผล</h3>
            <div className="space-y-2 text-sm">
                <label className="flex items-center cursor-pointer"><input type="checkbox" checked={visibleLevels.province} onChange={() => toggleVisibleLevel('province')} className="mr-2 form-checkbox h-4 w-4 text-blue-600 rounded"/><span>จังหวัด</span></label>
                <label className="flex items-center cursor-pointer"><input type="checkbox" checked={visibleLevels.district} onChange={() => toggleVisibleLevel('district')} className="mr-2 form-checkbox h-4 w-4 text-blue-600 rounded" disabled={!districts || districts.length === 0}/><span>อำเภอ</span></label>
                <label className="flex items-center cursor-pointer"><input type="checkbox" checked={visibleLevels.subdistrict} onChange={() => toggleVisibleLevel('subdistrict')} className="mr-2 form-checkbox h-4 w-4 text-blue-600 rounded" disabled={!subdistricts || subdistricts.length === 0}/><span>ตำบล</span></label>
            </div>
        </div>
        <button onClick={() => setShowControls(false)} className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md text-sm">ปิด</button>
    </div>
  );

  const LegendPanelContent = () => (
      <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold">คำอธิบายแผนที่</h3>
            <button onClick={() => setShowLegend(false)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          <div className="space-y-2 text-xs">
              {visibleLevels.province && (<div className="flex items-center"><div className="w-4 h-3 bg-blue-300 mr-2 rounded-sm"></div><span>จังหวัดที่เลือก</span></div>)}
              {visibleLevels.district && (<div className="flex items-center"><div className="w-4 h-3 bg-orange-200 mr-2 rounded-sm" style={{opacity: 0.6}}></div><span>อำเภอที่เลือก</span></div>)}
              {visibleLevels.subdistrict && (<div className="flex items-center"><div className="w-4 h-3 bg-green-200 mr-2 rounded-sm" style={{opacity: 0.6}}></div><span>ตำบลที่เลือก</span></div>)}
          </div>
          {selectedProvinces.length > 0 && (
             <div className="mt-3 pt-3 border-t">
                <h4 className="text-xs font-semibold mb-1.5 flex justify-between items-center"><span>จังหวัดที่เลือก ({selectedProvinces.length})</span><button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-1.5 py-0.5 rounded text-[10px]" onClick={() => {clearProvinceSelection(); setShowLegend(false);}} title="ล้างจังหวัดที่เลือกทั้งหมด">ล้าง</button></h4>
                <div className="max-h-16 overflow-y-auto text-[11px] space-y-0.5">
                    {selectedProvinces.map(p => (<div key={p.id} className="flex justify-between items-center bg-gray-50 px-1 py-0.5 rounded-sm"><span className="truncate mr-1">{p.province_name}</span><button className="text-red-500 hover:text-red-700 font-bold text-[10px]" onClick={() => {handleProvinceClick(p); if(selectedProvinces.length === 1) setShowLegend(false);}} title={`ลบ ${p.province_name}`}>✕</button></div>))}
                </div>
            </div>
          )}
          {selectedDistricts.length > 0 && (
             <div className="mt-2 pt-2 border-t">
                <h4 className="text-xs font-semibold mb-1.5 flex justify-between items-center"><span>อำเภอที่เลือก ({selectedDistricts.length})</span><button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-1.5 py-0.5 rounded text-[10px]" onClick={() => {clearDistrictSelection(); setShowLegend(false);}} title="ล้างอำเภอที่เลือกทั้งหมด">ล้าง</button></h4>
                <div className="max-h-16 overflow-y-auto text-[11px] space-y-0.5">
                    {selectedDistricts.map(d => {
                        const prov = provinces.find(p => p.id === d.province_id);
                        return (<div key={d.id} className="flex justify-between items-center bg-gray-50 px-1 py-0.5 rounded-sm"><span className="truncate mr-1" title={`${d.district_name}${prov ? ` (${prov.province_name})` : ''}`}>{d.district_name}{prov && <span className="text-gray-400 text-[9px]"> ({prov.province_name_short || prov.province_name})</span>}</span><button className="text-red-500 hover:text-red-700 font-bold text-[10px]" onClick={() => {handleDistrictSelect(d, true); if(selectedDistricts.length === 1 && selectedSubdistricts.filter(sd => sd.district_id === d.id).length === 0) setShowLegend(false);}} title={`ลบ ${d.district_name}`}>✕</button></div>);
                     })}
                </div>
            </div>
          )}
          {selectedSubdistricts.length > 0 && (
             <div className="mt-2 pt-2 border-t">
                <h4 className="text-xs font-semibold mb-1.5 flex justify-between items-center"><span>ตำบลที่เลือก ({selectedSubdistricts.length})</span><button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-1.5 py-0.5 rounded text-[10px]" onClick={() => {clearSubdistrictSelection(); setShowLegend(false);}} title="ล้างตำบลที่เลือกทั้งหมด">ล้าง</button></h4>
                <div className="max-h-16 overflow-y-auto text-[11px] space-y-0.5">
                    {selectedSubdistricts.map(sd => {
                        const dist = districts.find(d => d.id === sd.district_id);
                        return (<div key={sd.id} className="flex justify-between items-center bg-gray-50 px-1 py-0.5 rounded-sm"><span className="truncate mr-1" title={`${sd.subdistrict_name}${dist ? ` (${dist.district_name})` : ''}`}>{sd.subdistrict_name}{dist && <span className="text-gray-400 text-[9px]"> ({dist.district_name_short || dist.district_name})</span>}</span><button className="text-red-500 hover:text-red-700 font-bold text-[10px]" onClick={() => {handleSubdistrictSelect(sd, true); if(selectedSubdistricts.length === 1) setShowLegend(false);}} title={`ลบ ${sd.subdistrict_name}`}>✕</button></div>);
                    })}
                </div>
            </div>
          )}
          {selectedProvinces.length === 0 && selectedDistricts.length === 0 && selectedSubdistricts.length === 0 && (<p className="text-gray-400 italic text-xs mt-2">ไม่มีพื้นที่ที่เลือก</p>)}
          <button onClick={() => setShowLegend(false)} className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md text-sm">ปิด</button>
      </div>
  );


  return (
    <div className="flex flex-col h-screen w-full relative">
      <div className="h-full w-full relative">
        {/* Map View */}
        <div className="absolute inset-0">
          <div style={{ position: 'absolute', inset: 0, display: mapView === 'leaflet' ? 'block' : 'none', zIndex: mapView === 'leaflet' ? 1 : 0 }}>
             <LeafletMap
                selectedProvinces={selectedProvinces}
                selectedDistricts={selectedDistricts}
                selectedSubdistricts={selectedSubdistricts}
                visibleLevels={visibleLevels}
                onProvinceClick={handleProvinceClick}
                onDistrictSelect={handleDistrictSelect}
                onSubdistrictSelect={handleSubdistrictSelect}
                filters={leafletMapFilters} 
                detailedFilters={activeEvidenceFilters} 
                showElements={showElements}
                viewMode={viewMode}
                evidenceData={mockEvidenceData}
                isMobile={true}
              />
          </div>
          <div style={{ position: 'absolute', inset: 0, display: mapView === 'svg' ? 'block' : 'none', zIndex: mapView === 'svg' ? 1 : 0 }}>
             <SvgMap
                selectedProvinces={selectedProvinces}
                selectedDistricts={selectedDistricts}
                selectedSubdistricts={selectedSubdistricts}
                visibleLevels={visibleLevels}
                onProvinceClick={handleProvinceClick}
                onDistrictSelect={handleDistrictSelect}
                onSubdistrictSelect={handleSubdistrictSelect}
                onSelectionChange={handleSelectionChange}
                filters={leafletMapFilters} 
                // detailedFilters={activeEvidenceFilters} // Pass if SvgMap needs it
                showElements={showElements}
                viewMode={viewMode}
                evidenceData={mockEvidenceData}
                isMobile={true}
              />
          </div>
        </div>

        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-white bg-opacity-90 p-2 shadow-md flex justify-between items-center">
          <div className="flex space-x-2"><button className={`px-3 py-1.5 text-xs font-medium rounded-md ${mapView === 'leaflet' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setMapView('leaflet')}>แผนที่ภูมิศาสตร์</button><button className={`px-3 py-1.5 text-xs font-medium rounded-md ${mapView === 'svg' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={() => setMapView('svg')}>แผนภาพ</button></div>
          <div className="flex space-x-2"><button onClick={() => setShowEvidenceFilterPanel(prev => !prev)} className="bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-medium">ประเภท</button><button onClick={toggleFilter} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium">พื้นที่</button></div>
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute bottom-20 right-4 flex flex-col space-y-3 z-30">
          <button onClick={() => setShowControls(!showControls)} className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center" aria-label="Map Controls"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
          <button onClick={() => setShowLegend(!showLegend)} className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center" aria-label="Map Legend"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line><rect x="7" y="7" width="0" height="0"></rect></svg></button>
          <button onClick={() => setShowStats(!showStats)} className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center" aria-label="Statistics"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg></button>
        </div>

        {/* Control Panel Slide-up */}
        {showControls && (<div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg z-40 transition-transform transform animate-slide-up max-h-[70vh] overflow-y-auto"><ControlsPanelContent /></div>)}
        {/* Legend Slide-up */}
        {showLegend && (<div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg z-40 transition-transform transform animate-slide-up max-h-[70vh] overflow-y-auto"><LegendPanelContent /></div>)}
        {/* Statistics Panel Slide-up */}
        {showStats && (<div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg z-40 max-h-[70vh] overflow-y-auto transition-transform transform animate-slide-up"><div className="p-4"><StatisticsPanel selectedAreas={selectedAreas} provinceData={provinceData} isVisible={true} isMobile={true} activeLeafletFilters={leafletMapFilters} detailedFilters={activeEvidenceFilters} mockEvidenceData={mockEvidenceData} activeMainCategoryFilter={activeEvidenceFilters.activeMainCategory}/></div><button onClick={() => setShowStats(false)} className="sticky bottom-0 w-full bg-gray-600 text-white py-2.5 text-sm ">ปิดสถิติ</button></div>)}
        
        {/* Location Filter Modal */}
        {showFilter && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
              <LocationFilterModalContent />
            </div>
          </div>
        )}

        {/* Evidence Filter Modal */}
        {showEvidenceFilterPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b"><div className="flex justify-between items-center"><h3 className="font-medium text-lg">ตัวกรองวัตถุพยาน</h3><button onClick={() => setShowEvidenceFilterPanel(false)} className="text-gray-500" aria-label="Close Evidence Filter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div></div>
                <div className="overflow-y-auto flex-grow p-4 space-y-3 text-sm">
                    {/* Main Category Selection */}
                    <div className="mb-3"><p className="text-sm font-medium mb-1.5">เลือกประเภทหลัก:</p><div className="flex flex-wrap gap-2">{Object.entries(mainCategories).map(([key, name]) => (<button key={key} onClick={() => handleMainCategoryChange(key)} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${activeEvidenceFilters.activeMainCategory === key ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{name}</button>))}</div></div>
                    {/* Sub-filters */}
                    {(activeEvidenceFilters.activeMainCategory === 'all' || activeEvidenceFilters.activeMainCategory === 'drugs') && (
                        <div className="p-2.5 border rounded-md">
                            <h3 className="text-sm font-semibold mb-1.5 text-purple-700">ยาเสพติด</h3>
                            {Object.keys(evidenceFilterOptions.drugSubcategories || {}).length > 0 && <div className="mb-2 pt-1"><p className="font-medium text-xs mb-1">ลักษณะ:</p><div className="flex flex-col gap-1">{Object.entries(evidenceFilterOptions.drugSubcategories).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.drugSubcategories[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('drugSubcategory', key)} className="form-checkbox h-4 w-4 text-purple-500 rounded mr-1.5"/><span className="text-xs">{name}</span></label>))}</div></div>}
                            {Object.keys(evidenceFilterOptions.drugStamps || {}).length > 0 && <div className="mb-2 border-t pt-2"><p className="font-medium text-xs mb-1">ตราประทับ:</p><div className="flex flex-col gap-1">{Object.entries(evidenceFilterOptions.drugStamps).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.drugStamps[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('drugStamp', key)} className="form-checkbox h-4 w-4 text-purple-500 rounded mr-1.5"/><span className="text-xs">{name || '(ไม่ระบุ)'}</span></label>))}</div></div>}
                            {Object.keys(evidenceFilterOptions.drugTypes || {}).length > 0 && <div className="mb-2 border-t pt-2"><p className="font-medium text-xs mb-1">ประเภทสาร:</p><div className="flex flex-col gap-1">{Object.entries(evidenceFilterOptions.drugTypes).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.drugTypes[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('drugType', key)} className="form-checkbox h-4 w-4 text-purple-500 rounded mr-1.5"/><span className="text-xs">{name}</span></label>))}</div></div>}
                            {Object.keys(evidenceFilterOptions.drugCategories || {}).length > 0 && <div className="border-t pt-2"><p className="font-medium text-xs mb-1">ประเภทตามกฎหมาย:</p><div className="flex flex-col gap-1">{Object.entries(evidenceFilterOptions.drugCategories).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.drugCategories[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('drugCategory', key)} className="form-checkbox h-4 w-4 text-purple-500 rounded mr-1.5"/><span className="text-xs">ประเภท {name}</span></label>))}</div></div>}
                        </div>
                    )}
                     {(activeEvidenceFilters.activeMainCategory === 'all' || activeEvidenceFilters.activeMainCategory === 'guns') && (
                        <div className="p-2.5 border rounded-md">
                            <h3 className="text-sm font-semibold mb-1.5 text-indigo-700">อาวุธปืน</h3>
                            {Object.keys(evidenceFilterOptions.gunSubcategories || {}).length > 0 && <div className="mb-2 pt-1"><p className="font-medium text-xs mb-1">ประเภทปืน:</p><div className="flex flex-col gap-1">{Object.entries(evidenceFilterOptions.gunSubcategories).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.gunSubcategories[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('gunSubcategory', key)} className="form-checkbox h-4 w-4 text-indigo-500 rounded mr-1.5"/><span className="text-xs">{name}</span></label>))}</div></div>}
                            {Object.keys(evidenceFilterOptions.gunMechanics || {}).length > 0 && <div className="mb-2 border-t pt-2"><p className="font-medium text-xs mb-1">กลไก:</p><div className="flex flex-col gap-1">{Object.entries(evidenceFilterOptions.gunMechanics).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.gunMechanics[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('gunMechanic', key)} className="form-checkbox h-4 w-4 text-indigo-500 rounded mr-1.5"/><span className="text-xs">{name}</span></label>))}</div></div>}
                            {Object.keys(evidenceFilterOptions.gunBrands || {}).length > 0 && <div className="mb-2 border-t pt-2"><p className="font-medium text-xs mb-1">ยี่ห้อ:</p><div className="flex flex-col gap-1">{Object.entries(evidenceFilterOptions.gunBrands).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.gunBrands[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('gunBrand', key)} className="form-checkbox h-4 w-4 text-indigo-500 rounded mr-1.5"/><span className="text-xs">{name}</span></label>))}</div></div>}
                            {Object.keys(evidenceFilterOptions.gunModels || {}).length > 0 && <div className="border-t pt-2"><p className="font-medium text-xs mb-1">รุ่น:</p><div className="flex flex-col gap-1">{Object.entries(evidenceFilterOptions.gunModels).sort(([,a],[,b])=>a.localeCompare(b)).map(([key, name]) => (<label key={key} className="flex items-center cursor-pointer"><input type="checkbox" checked={activeEvidenceFilters.gunModels[key] ?? false} onChange={() => handleEvidenceSubFilterToggle('gunModel', key)} className="form-checkbox h-4 w-4 text-indigo-500 rounded mr-1.5"/><span className="text-xs">{name}</span></label>))}</div></div>}
                        </div>
                    )}
                </div>
                 <div className="p-3 border-t">
                    <button onClick={() => setShowEvidenceFilterPanel(false)} className="w-full bg-purple-600 text-white py-2 rounded-md text-sm hover:bg-purple-700">ใช้ตัวกรอง</button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main Map Component ---
const Map = () => {
  const API_PATH = '/api';
  const { isMobile } = useDevice();
  const [mapView, setMapView] = useState('leaflet');
  const [viewMode, setViewMode] = useState('markers');
  const [selectedAreas, setSelectedAreas] = useState({ provinces: [], districts: [], subdistricts: [] });
  const [showElements, setShowElements] = useState({ routes: true, distribution: true, hotspots: true });
  const [showFilter, setShowFilter] = useState(false); // Location filter panel

  // Evidence Filter States
  const [showEvidenceFilterPanel, setShowEvidenceFilterPanel] = useState(false);
  const [evidenceFilterOptions, setEvidenceFilterOptions] = useState({
    drugSubcategories: {}, drugStamps: {}, drugTypes: {}, drugCategories: {},
    gunSubcategories: {}, gunMechanics: {}, gunBrands: {}, gunModels: {}
  });
  const [activeEvidenceFilters, setActiveEvidenceFilters] = useState({
    activeMainCategory: 'all',
    drugSubcategories: {}, drugStamps: {}, drugTypes: {}, drugCategories: {},
    gunSubcategories: {}, gunMechanics: {}, gunBrands: {}, gunModels: {}
  });

  // Location Data States
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);

  const [loadingStates, setLoadingStates] = useState({
    provinces: true,
    districts: true,
    subdistricts: true,
  });

  // Location Search & Selection States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedSubdistricts, setSelectedSubdistricts] = useState([]);
  const [expandedProvinces, setExpandedProvinces] = useState({});
  const [expandedDistricts, setExpandedDistricts] = useState({});

  // Map Visibility Level State
  const [visibleLevels, setVisibleLevels] = useState({ province: true, district: false, subdistrict: false });

  // Initialize evidence filter options and default active filters
  useEffect(() => {
    const options = {
      drugSubcategories: new Set(), drugStamps: new Set(), drugTypes: new Set(), drugCategories: new Set(),
      gunSubcategories: new Set(), gunMechanics: new Set(), gunBrands: new Set(), gunModels: new Set()
    };

    mockEvidenceData.forEach(item => {
      if (item.category === "ยาเสพติด") {
        if(item.subcategory) options.drugSubcategories.add(item.subcategory);
        if(item.stamp) options.drugStamps.add(item.stamp);
        if(item.drug_type) options.drugTypes.add(item.drug_type);
        if(item.drug_category) options.drugCategories.add(item.drug_category);
      } else if (item.category === "อาวุธปืน") {
        if(item.subcategory) options.gunSubcategories.add(item.subcategory);
        if(item.mechanic) options.gunMechanics.add(item.mechanic);
        if(item.brand) options.gunBrands.add(item.brand);
        if(item.model) options.gunModels.add(item.model);
      }
    });

    const createOptionsObject = (set) => {
      const obj = {};
      Array.from(set).sort().forEach(val => { obj[String(val)] = String(val); }); 
      return obj;
    };
    const createActiveObject = (optionsObj) => { // Changed to take optionsObj
      const obj = {};
      Object.keys(optionsObj).forEach(key => { obj[key] = true; });
      return obj;
    };
    
    const newEvidenceFilterOptions = {
      drugSubcategories: createOptionsObject(options.drugSubcategories),
      drugStamps: createOptionsObject(options.drugStamps),
      drugTypes: createOptionsObject(options.drugTypes),
      drugCategories: createOptionsObject(options.drugCategories),
      gunSubcategories: createOptionsObject(options.gunSubcategories),
      gunMechanics: createOptionsObject(options.gunMechanics),
      gunBrands: createOptionsObject(options.gunBrands),
      gunModels: createOptionsObject(options.gunModels),
    };
    setEvidenceFilterOptions(newEvidenceFilterOptions);

    setActiveEvidenceFilters(prev => ({
      ...prev, // Preserves activeMainCategory if already set, or defaults
      drugSubcategories: createActiveObject(newEvidenceFilterOptions.drugSubcategories),
      drugStamps: createActiveObject(newEvidenceFilterOptions.drugStamps),
      drugTypes: createActiveObject(newEvidenceFilterOptions.drugTypes),
      drugCategories: createActiveObject(newEvidenceFilterOptions.drugCategories),
      gunSubcategories: createActiveObject(newEvidenceFilterOptions.gunSubcategories),
      gunMechanics: createActiveObject(newEvidenceFilterOptions.gunMechanics),
      gunBrands: createActiveObject(newEvidenceFilterOptions.gunBrands),
      gunModels: createActiveObject(newEvidenceFilterOptions.gunModels),
    }));
  }, []); // Runs once, depends on mockEvidenceData implicitly

  // Derive SIMPLE filters for LeafletMap (heatmap/aggregation)
  const leafletMapFilters = useMemo(() => {
    const lmFilters = {};
    const { activeMainCategory, drugTypes, gunSubcategories, gunMechanics, gunBrands, gunModels } = activeEvidenceFilters;

    if (activeMainCategory === 'all' || activeMainCategory === 'drugs') {
      Object.keys(drugTypes || {}).forEach(dtKey => {
        if (drugTypes[dtKey]) { lmFilters[dtKey] = true; }
      });
    }

    if (activeMainCategory === 'all' || activeMainCategory === 'guns') {
      const anyGunFilterActive = [gunSubcategories, gunMechanics, gunBrands, gunModels].some(
          filterGroup => Object.values(filterGroup || {}).some(isActive => isActive)
      );
      if (anyGunFilterActive) { lmFilters['gun'] = true; } // General 'gun' category for simple filter
    }
    return lmFilters;
  }, [activeEvidenceFilters]);

  // Calculate province data for StatisticsPanel based on DETAILED filters
  const provinceData = useMemo(() => {
    const provinceCount = {};
    const filters = activeEvidenceFilters;

    mockEvidenceData.forEach(item => {
      let passesFilter = false;
      const itemCategory = item.category;
      const itemSubcategory = String(item.subcategory);
      const itemStamp = String(item.stamp);
      const itemDrugType = String(item.drug_type);
      const itemDrugCategory = String(item.drug_category);
      const itemMechanic = String(item.mechanic);
      const itemBrand = String(item.brand);
      const itemModel = String(item.model);

      if (itemCategory === 'ยาเสพติด' && (filters.activeMainCategory === 'all' || filters.activeMainCategory === 'drugs')) {
          passesFilter = (
              (filters.drugSubcategories?.[itemSubcategory] ?? true) &&
              (filters.drugStamps?.[itemStamp] ?? true) &&
              (filters.drugTypes?.[itemDrugType] ?? true) &&
              (filters.drugCategories?.[itemDrugCategory] ?? true)
          );
      } else if (itemCategory === 'อาวุธปืน' && (filters.activeMainCategory === 'all' || filters.activeMainCategory === 'guns')) {
          passesFilter = (
              (filters.gunSubcategories?.[itemSubcategory] ?? true) &&
              (filters.gunMechanics?.[itemMechanic] ?? true) &&
              (filters.gunBrands?.[itemBrand] ?? true) &&
              (filters.gunModels?.[itemModel] ?? true)
          );
      }


      if (passesFilter) {
        if (!provinceCount[item.province]) {
          provinceCount[item.province] = 0;
        }
        provinceCount[item.province]++;
      }
    });

    return Object.entries(provinceCount)
      .map(([province, cases]) => ({ province, cases }))
      .sort((a, b) => b.cases - a.cases);
  }, [activeEvidenceFilters]); // Depend on the detailed filters


  // Handler for main evidence category change
  const handleMainCategoryChange = useCallback((mainCategoryKey) => {
    setActiveEvidenceFilters(prev => {
        const newState = { ...prev, activeMainCategory: mainCategoryKey };
        const resetSubFilters = (optionsObj) => {
            const activeObj = {};
            Object.keys(optionsObj || {}).forEach(key => { activeObj[key] = true; }); 
            return activeObj;
        };

        newState.drugSubcategories = resetSubFilters(evidenceFilterOptions.drugSubcategories);
        newState.drugStamps = resetSubFilters(evidenceFilterOptions.drugStamps);
        newState.drugTypes = resetSubFilters(evidenceFilterOptions.drugTypes);
        newState.drugCategories = resetSubFilters(evidenceFilterOptions.drugCategories);
        newState.gunSubcategories = resetSubFilters(evidenceFilterOptions.gunSubcategories);
        newState.gunMechanics = resetSubFilters(evidenceFilterOptions.gunMechanics);
        newState.gunBrands = resetSubFilters(evidenceFilterOptions.gunBrands);
        newState.gunModels = resetSubFilters(evidenceFilterOptions.gunModels);

        return newState;
    });
  }, [evidenceFilterOptions]);


  // Handler for toggling individual sub-filters
  const handleEvidenceSubFilterToggle = useCallback((subFilterType, key) => {
    setActiveEvidenceFilters(prev => {
      // Map ชื่อพารามิเตอร์ให้ตรงกับชื่อ state จริงๆ
      const stateKeyMap = {
        'drugSubcategory': 'drugSubcategories',
        'drugStamp': 'drugStamps',
        'drugType': 'drugTypes', 
        'drugCategory': 'drugCategories',
        'gunSubcategory': 'gunSubcategories',
        'gunMechanic': 'gunMechanics',
        'gunBrand': 'gunBrands',
        'gunModel': 'gunModels'
      };
      
      // หาคีย์ที่ถูกต้องจาก mapping
      const stateKey = stateKeyMap[subFilterType];
      
      if (!stateKey || !prev[stateKey]) {
        console.warn(`Sub-filter type "${subFilterType}" could not be mapped to a valid state key.`);
        return prev;
      }
      
      const newSubFilters = { ...prev[stateKey] };
      newSubFilters[key] = !newSubFilters[key];
      
      return { ...prev, [stateKey]: newSubFilters };
    });
  }, []);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      // setLoadingStates({ provinces: true, districts: true, subdistricts: true }); // Already initial state

    try {
      // Fetch provinces first
      const provincesResponse = await axios.get(`${apiConfig.baseUrl}${API_PATH}/provinces`);
      setProvinces(provincesResponse.data);
      setLoadingStates(prev => ({ ...prev, provinces: false }));

      // Fetch districts and subdistricts in parallel after provinces are available for a slightly better UX
      // or if they depend on province data (though not in this direct fetch)
      const [districtsResponse, subdistrictsResponse] = await Promise.all([
        axios.get(`${apiConfig.baseUrl}${API_PATH}/districts`),
        axios.get(`${apiConfig.baseUrl}${API_PATH}/subdistricts`)
      ]);

      setDistricts(districtsResponse.data.map(d => ({...d, province_id: d.province_id || d.prov_id || null })));
      setLoadingStates(prev => ({ ...prev, districts: false }));

      setSubdistricts(subdistrictsResponse.data.map(sd => ({...sd, district_id: sd.district_id || null })));
      setLoadingStates(prev => ({ ...prev, subdistricts: false }));

    } catch (error) {
      console.error('Error fetching map data:', error);
      // Set all to false on error to stop loading indicators
      setLoadingStates({ provinces: false, districts: false, subdistricts: false });
    }
    // No finally block needed here as states are set progressively
  };
  fetchData();
  }, []);

  // --- Selection Handling ---
  const handleSelectionChange = useCallback(selections => {
    // Prevent unnecessary re-renders if selection hasn't actually changed
    if (
        JSON.stringify(selectedProvinces) === JSON.stringify(selections.provinces) &&
        JSON.stringify(selectedDistricts) === JSON.stringify(selections.districts) &&
        JSON.stringify(selectedSubdistricts) === JSON.stringify(selections.subdistricts)
    ) {
        return;
    }
    setSelectedProvinces(selections.provinces);
    setSelectedDistricts(selections.districts);
    setSelectedSubdistricts(selections.subdistricts);
    setSelectedAreas(selections); // This seems redundant if selectedProvinces etc. are the source of truth for selectedAreas
  }, [selectedProvinces, selectedDistricts, selectedSubdistricts]); // Added dependencies

  useEffect(() => { // Update selectedAreas whenever individual selections change
    setSelectedAreas({
        provinces: selectedProvinces,
        districts: selectedDistricts,
        subdistricts: selectedSubdistricts,
    });
  }, [selectedProvinces, selectedDistricts, selectedSubdistricts]);


  const handleProvinceClick = useCallback((province, forceSelect = false) => {
    setSelectedProvinces(prevSelectedProvinces => {
      const isSelected = prevSelectedProvinces.some(p => p.id === province.id);
      let newSelectedProvinces = prevSelectedProvinces;
      let newSelectedDistricts = selectedDistricts;
      let newSelectedSubdistricts = selectedSubdistricts;

      if (!isSelected || forceSelect) { // Select if not selected, or if forced
        if (!isSelected) { // Only add if not already there
            newSelectedProvinces = [...prevSelectedProvinces, province];
        }
        setVisibleLevels(prev => ({ ...prev, district: true }));
      } else { // Deselect
        newSelectedProvinces = prevSelectedProvinces.filter(p => p.id !== province.id);
        // Also clear districts and subdistricts belonging to the deselected province
        newSelectedDistricts = selectedDistricts.filter(d => d.province_id !== province.id);
        const deselectedDistrictIds = selectedDistricts
            .filter(d => d.province_id === province.id)
            .map(d => d.id);
        newSelectedSubdistricts = selectedSubdistricts.filter(sd => !deselectedDistrictIds.includes(sd.district_id));
      }
      // Update all states together
      setSelectedDistricts(newSelectedDistricts);
      setSelectedSubdistricts(newSelectedSubdistricts);
      return newSelectedProvinces;
    });
  }, [selectedDistricts, selectedSubdistricts]); // Removed handleSelectionChange from deps

  const handleDistrictSelect = useCallback((district, isCurrentlySelectedInCheckbox, forceSelect = false) => {
    setSelectedDistricts(prevSelectedDistricts => {
        const isAlreadyPresent = prevSelectedDistricts.some(d => d.id === district.id);
        let newSelectedDistricts = prevSelectedDistricts;
        let newSelectedSubdistricts = selectedSubdistricts;

        if (!isAlreadyPresent || forceSelect) { // Select
            if(!isAlreadyPresent) {
                newSelectedDistricts = [...prevSelectedDistricts, district];
            }
            setVisibleLevels(prev => ({ ...prev, subdistrict: true }));
             // Auto-select parent province if not already selected
            if (!selectedProvinces.some(p => p.id === district.province_id)) {
                const parentProvince = provinces.find(p => p.id === district.province_id);
                if (parentProvince) {
                    setSelectedProvinces(prev => [...prev, parentProvince]);
                }
            }
        } else { // Deselect (isCurrentlySelectedInCheckbox would be true here)
            newSelectedDistricts = prevSelectedDistricts.filter(d => d.id !== district.id);
            newSelectedSubdistricts = selectedSubdistricts.filter(sd => sd.district_id !== district.id);
        }
        setSelectedSubdistricts(newSelectedSubdistricts);
        return newSelectedDistricts;
    });
  }, [selectedSubdistricts, selectedProvinces, provinces]);

  const handleSubdistrictSelect = useCallback((subdistrict, isCurrentlySelectedInCheckbox, forceSelect = false) => {
    setSelectedSubdistricts(prevSelectedSubdistricts => {
        const isAlreadyPresent = prevSelectedSubdistricts.some(sd => sd.id === subdistrict.id);
        let newSelectedSubdistricts = prevSelectedSubdistricts;

        if (!isAlreadyPresent || forceSelect) { // Select
            if (!isAlreadyPresent) {
                newSelectedSubdistricts = [...prevSelectedSubdistricts, subdistrict];
            }
            // Auto-select parent district and province if not already selected
            const parentDistrict = districts.find(d => d.id === subdistrict.district_id);
            if (parentDistrict && !selectedDistricts.some(d => d.id === parentDistrict.id)) {
                setSelectedDistricts(prev => [...prev, parentDistrict]);
                if (!selectedProvinces.some(p => p.id === parentDistrict.province_id)) {
                    const parentProvince = provinces.find(p => p.id === parentDistrict.province_id);
                    if (parentProvince) {
                        setSelectedProvinces(prev => [...prev, parentProvince]);
                    }
                }
            }
        } else { // Deselect
            newSelectedSubdistricts = prevSelectedSubdistricts.filter(sd => sd.id !== subdistrict.id);
        }
        return newSelectedSubdistricts;
    });
  }, [selectedDistricts, selectedProvinces, districts, provinces]);


  const clearProvinceSelection = useCallback(() => {
    setSelectedProvinces([]);
    setSelectedDistricts([]);
    setSelectedSubdistricts([]);
  }, []);
  const clearDistrictSelection = useCallback(() => {
    setSelectedDistricts([]);
    setSelectedSubdistricts([]);
  }, []);
  const clearSubdistrictSelection = useCallback(() => {
    setSelectedSubdistricts([]);
  }, []);

  // --- UI Controls ---
  const toggleFilter = useCallback(() => setShowFilter(prev => !prev), []);
  const toggleProvinceExpansion = useCallback((provinceId) => setExpandedProvinces(prev => ({ ...prev, [provinceId]: !prev[provinceId] })), []);
  const toggleDistrictExpansion = useCallback((districtId) => setExpandedDistricts(prev => ({ ...prev, [districtId]: !prev[districtId] })), []);
  const toggleVisibleLevel = useCallback((level) => setVisibleLevels(prev => ({ ...prev, [level]: !prev[level] })), []);

  // Filtered Data for Location Search
  const getFilteredData = useCallback(() => {
    if (!searchTerm.trim()) { return provinces.map(province => ({ province, districts: districts.filter(d => d.province_id === province.id).map(district => ({...district, subdistricts: subdistricts.filter(sd => sd.district_id === district.id)})) })).sort((a,b) => a.province.province_name.localeCompare(b.province.province_name)); }
    const term = searchTerm.toLowerCase().trim(); const resultProvinces = new Map();
    provinces.forEach(p => { const provinceNameLower = p.province_name.toLowerCase(); let provinceMatch = provinceNameLower.includes(term); let districtsInProvince = [];
      districts.filter(d => d.province_id === p.id).forEach(d => { const districtNameLower = (d.district_name || d.amphoe_t || '').toLowerCase(); let districtMatch = districtNameLower.includes(term); let subdistrictsInDistrict = [];
        subdistricts.filter(sd => sd.district_id === d.id).forEach(sd => { const subdistrictNameLower = (sd.subdistrict_name || sd.tambon_t || '').toLowerCase(); if (subdistrictNameLower.includes(term)) { subdistrictsInDistrict.push(sd); districtMatch = true; provinceMatch = true; } });
        if (districtMatch) { districtsInProvince.push({ ...d, subdistricts: subdistrictsInDistrict.sort((a,b) => (a.subdistrict_name || a.tambon_t).localeCompare(b.subdistrict_name || b.tambon_t)) }); provinceMatch = true; } });
      if (provinceMatch) { resultProvinces.set(p.id, { province: p, districts: districtsInProvince.sort((a,b) => (a.district_name || a.amphoe_t).localeCompare(b.district_name || b.amphoe_t)), }); } });
    return Array.from(resultProvinces.values()).sort((a,b) => a.province.province_name.localeCompare(b.province.province_name));
  }, [provinces, districts, subdistricts, searchTerm]);

  // --- Props for Layouts ---
  const overallLoadingForFilter = loadingStates.provinces || loadingStates.districts || loadingStates.subdistricts;

  const sharedProps = {
    mapView, setMapView, viewMode, setViewMode, selectedAreas, showElements,
    showFilter, setShowFilter,
    showEvidenceFilterPanel, setShowEvidenceFilterPanel, evidenceFilterOptions, activeEvidenceFilters, handleMainCategoryChange, handleEvidenceSubFilterToggle,
    leafletMapFilters,
    provinces, districts, subdistricts, 
    loading: overallLoadingForFilter, // Pass the combined loading state for filter panel
    searchTerm, setSearchTerm,
    selectedProvinces, selectedDistricts, selectedSubdistricts, expandedProvinces, expandedDistricts,
    visibleLevels, provinceData,
    handleSelectionChange, handleProvinceClick, handleDistrictSelect, handleSubdistrictSelect,
    clearProvinceSelection, clearDistrictSelection, clearSubdistrictSelection,
    toggleFilter, toggleProvinceExpansion, toggleDistrictExpansion, toggleVisibleLevel,
    getFilteredData,
  };

  // --- Animation Style ---
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }`;
    document.head.appendChild(styleElement);
    return () => { if (document.head.contains(styleElement)) document.head.removeChild(styleElement); };
  }, []);

  if (loadingStates.provinces && provinces.length === 0) { // Show main loading if provinces are loading and not yet available
    return <div className="flex justify-center items-center h-screen w-screen"><p>Loading map data...</p></div>;
  }

  return (
    <>
      <div className="hidden md:block w-full h-full">
        <DesktopLayout {...sharedProps} />
      </div>
      <div className="md:hidden w-full h-full">
        <MobileLayout {...sharedProps} />
      </div>
    </>
  );
};

export default Map;