import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import AppCurrentVisits from '../app-current-visits';
import AppWebsiteVisits from '../app-website-visits';
import AppWidgetSummary from '../app-widget-summary';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'src/firebase/firebaseConfig';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function AppView() {
  const [sales, setSales] = useState([]);
  const [todayOrders, setTodayOrders] = useState('');
  const [totalOrders, setTotalOrders] = useState('');
  const [totalSales, setTotalSales] = useState('');
  const [today, setToday] = useState('');
  const [yesterday, setYesterday] = useState('');
  const [threeDays, setThreeDays] = useState('');
  const [sevenDays, setSevenDays] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = [];
        const dataRef = query(collection(db, 'data_sales'));
        const dataSnap = await getDocs(dataRef);
        dataSnap.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        const today = new Date();
        const todays = new Date(new Date().setDate(today.getDate()));
        const yesterday = new Date(new Date().setDate(today.getDate() - 1));
        const threeDaysAgo = new Date(new Date().setDate(today.getDate() - 3));
        const fourDaysAgo = new Date(new Date().setDate(today.getDate() - 4));
        const sevenDaysAgo = new Date(new Date().setDate(today.getDate() - 7));

        const todayRef = query(
          collection(db, 'data_sales'),
          where('timeStamp', '>', yesterday),
          where('timeStamp', '<=', todays)
        );
        const yesterdayRef = query(
          collection(db, 'data_sales'),
          where('timeStamp', '>', threeDaysAgo),
          where('timeStamp', '<=', yesterday)
        );
        const threeDaysAgoRef = query(
          collection(db, 'data_sales'),
          where('timeStamp', '>', fourDaysAgo),
          where('timeStamp', '<=', threeDaysAgo)
        );
        const sevenDaysAgoRef = query(
          collection(db, 'data_sales'),
          where('timeStamp', '>', sevenDaysAgo),
          where('timeStamp', '<=', fourDaysAgo)
        );

        const todaySnap = await getDocs(todayRef);
        const yesterdaySnap = await getDocs(yesterdayRef);
        const threeDaysSnap = await getDocs(threeDaysAgoRef);
        const sevenDaysSnap = await getDocs(sevenDaysAgoRef);

        const todayDataArray = todaySnap.docs.map((doc) => doc.data());
        const todayTotal = todayDataArray.reduce((acc, item) => acc + item.totalPrice, 0);

        const yesterdayDataArray = yesterdaySnap.docs.map((doc) => doc.data());
        const yesterdayTotal = yesterdayDataArray.reduce((acc, item) => acc + item.totalPrice, 0);

        const threeDaysDataArray = threeDaysSnap.docs.map((doc) => doc.data());
        const threeDaysTotal = threeDaysDataArray.reduce((acc, item) => acc + item.totalPrice, 0);

        const sevenDaysDataArray = sevenDaysSnap.docs.map((doc) => doc.data());
        const sevenDaysTotal = sevenDaysDataArray.reduce((acc, item) => acc + item.totalPrice, 0);

        const totalSales = data.reduce((acc, item) => acc + item.totalPrice, 0);

        setToday(todayTotal);
        setYesterday(yesterdayTotal);
        setThreeDays(threeDaysTotal);
        setSevenDays(sevenDaysTotal);

        setTotalOrders(dataSnap.docs.length);
        setTodayOrders(todaySnap.docs.length);
        setTotalSales(totalSales);
        setSales(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);
  const items = sales.map((entry) => entry.items).flat();

  // Creating a map to accumulate quantities for each product
  const productQuantitiesMap = items.reduce((acc, item) => {
    const productName = item.productName;
    const quantity = parseInt(item.quantity, 10);

    if (acc.has(productName)) {
      acc.set(productName, acc.get(productName) + quantity);
    } else {
      acc.set(productName, quantity);
    }

    return acc;
  }, new Map());

  // Creating the series data for the chart
  const seriesData = Array.from(productQuantitiesMap.entries()).map(([label, value]) => ({
    label,
    value,
  }));

  console.log(sales);
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
      POS of B & M Store
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Today's Orders"
            total={todayOrders}
            color="success"
            icon={<img alt="icon" src="/assets/icon/briefcase.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Orders"
            total={totalOrders}
            color="info"
            icon={<img alt="icon" src="/assets/icon/strategic-plan.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Today's Sales"
            total={`₱ ${fCurrency(today)}`}
            color="warning"
            icon={<img alt="icon" src="/assets/icon/coins.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AppWidgetSummary
            title="Total Sales"
            total={`₱ ${fCurrency(totalSales)}`}
            color="error"
            icon={<img alt="icon" src="/assets/icon/money.png" />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppWebsiteVisits
            title="Last 7 Days Sales"
            subheader=""
            chart={{
              labels: [
                'Today',
                'Yesterday',
                'Last 3 Days',
                'Last 4-7 Days', // A range that includes the last 7 days
              ],
              series: [
                {
                  name: 'Sales',
                  type: 'column',
                  fill: 'solid',
                  data: [`${today}`, `${yesterday}`, `${threeDays}`, `${sevenDays}`],
                },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentVisits
            title="Sale by Products"
            chart={{
              series: seriesData,
            }}
          />
        </Grid>

      </Grid>
    </Container>
  );
}
