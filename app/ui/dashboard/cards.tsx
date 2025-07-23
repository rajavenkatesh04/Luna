import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

const iconMap = {
    Announcement: BanknotesIcon,
    User: UserGroupIcon,
    Poll: ClockIcon,
    Event: InboxIcon,
};


export default async function CardWrapper() {

  // const {totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers} = await fetchCardData();

  return (
    <>
      <Card title="Announcements"  type="Announcement" />
      <Card title="Events" type="Event" />
      <Card title="Admins"  type="User" />
      <Card title="Total Customers" type="User"/>
    </>
  );
}

export function Card({
  title,
  type,
}: {
  title: string;
  type: 'User' | 'Event' | 'Announcement' | 'Poll';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl border border-gray-500 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`4 py-8 text-center text-2xl`}
      >
      </p>
    </div>
  );
}
