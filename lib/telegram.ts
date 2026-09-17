import type { ProductPresentation } from '@/data/products';
import { productPresentationLabels } from '@/data/products';
import { siteConfig } from '@/data/site';
import type { Language } from '@/lib/language';

export type TelegramOrderLine = {
  name: string;
  presentation: ProductPresentation;
  quantity: number;
  unitPriceCents: number;
};

export type TelegramCustomerDetails = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  notes?: string;
};

type TelegramOrder = {
  language: Language;
  lines: TelegramOrderLine[];
  subtotalCents: number;
  customer: TelegramCustomerDetails;
};

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function buildTelegramOrderText({
  language,
  lines,
  subtotalCents,
  customer,
}: TelegramOrder) {
  const es = language === 'es';
  const productLines = lines.flatMap((line) => [
    `• ${line.name} / ${productPresentationLabels[line.presentation]}`,
    `  ${es ? 'Cantidad' : 'Quantity'}: ${line.quantity}`,
    `  ${es ? 'Precio' : 'Price'}: ${money(line.unitPriceCents)}`,
    `  Subtotal: ${money(line.unitPriceCents * line.quantity)}`,
  ]);

  return [
    `CUATESFARMZ — ${es ? 'SOLICITUD DE PEDIDO' : 'ORDER REQUEST'}`,
    '',
    ...productLines,
    '',
    `${es ? 'SUBTOTAL' : 'SUBTOTAL'}: ${money(subtotalCents)}`,
    '',
    es ? 'DATOS DE ENTREGA' : 'DELIVERY DETAILS',
    `${es ? 'Nombre' : 'Name'}: ${customer.name}`,
    `${es ? 'Dirección' : 'Address'}: ${customer.address}`,
    `${es ? 'Ciudad' : 'City'}: ${customer.city}`,
    `${es ? 'Estado' : 'State'}: ${customer.state}`,
    `ZIP: ${customer.zip}`,
    `${es ? 'Teléfono' : 'Phone'}: ${customer.phone}`,
    ...(customer.notes
      ? [`${es ? 'Notas de entrega' : 'Delivery notes'}: ${customer.notes}`]
      : []),
    '',
    es
      ? 'Quiero solicitar este pedido. Entiendo que el stock se confirma manualmente y que no se realizó ningún pago en la web.'
      : 'I would like to request this order. I understand stock is confirmed manually and no payment was made on the website.',
  ].join('\n');
}

export function buildTelegramOrderUrl(order: TelegramOrder) {
  const text = buildTelegramOrderText(order);
  return `${siteConfig.socials.telegram}?text=${encodeURIComponent(text)}`;
}
