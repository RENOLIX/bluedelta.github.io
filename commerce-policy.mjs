// Conditions explicitly authorized by the owner on 31 October 2026.
export const shippingDetails = () => ({
 '@type':'OfferShippingDetails',
 shippingDestination:{'@type':'DefinedRegion',addressCountry:'DZ'},
 shippingRate:{'@type':'MonetaryAmount',value:0,currency:'DZD'},
 deliveryTime:{'@type':'ShippingDeliveryTime',
  handlingTime:{'@type':'QuantitativeValue',minValue:0,maxValue:0,unitCode:'DAY'},
  transitTime:{'@type':'QuantitativeValue',minValue:0,maxValue:2,unitCode:'DAY'}
 }
});
export const merchantReturnPolicy = origin => ({
 '@type':'MerchantReturnPolicy','@id':origin+'/livraison-retours/#retours',
 applicableCountry:'DZ',returnPolicyCountry:'DZ',
 returnPolicyCategory:'https://schema.org/MerchantReturnFiniteReturnWindow',
 merchantReturnDays:14,
 returnMethod:['https://schema.org/ReturnInStore','https://schema.org/ReturnByMail'],
 returnFees:'https://schema.org/ReturnFeesCustomerResponsibility',
 refundType:'https://schema.org/FullRefund',
 merchantReturnLink:origin+'/livraison-retours/'
});
export const availability = product => Number.isFinite(product.stock)&&product.stock<=0?'https://schema.org/OutOfStock':'https://schema.org/InStock';

export function buildCommercePage({page,heading}){
 page('livraison-retours/','Livraison gratuite sous 48 h, paiement et retours','Livraison gratuite en Algérie sous 48 h après confirmation, paiement à réception et retours sous 14 jours : conditions BLUE DELTA.',`${heading('Livraison & retours','Livraison gratuite sous 48 h et paiement à réception.')}<section class="section"><div class="wrap prose"><h2>Livraison gratuite en Algérie</h2><p>La livraison des produits BLUE DELTA est gratuite en Algérie. Aucun frais de livraison ne s’ajoute au prix des produits affiché dans le panier.</p><p>La livraison intervient sous 48 heures après confirmation de la commande et des coordonnées de livraison par notre équipe. Indiquez une adresse complète, votre wilaya, votre commune et un numéro de téléphone joignable pour organiser la remise de votre commande.</p><h2>Paiement à réception</h2><p>Vous commandez sur le site, notre équipe confirme la commande, puis vous payez à réception. Aucun paiement en ligne n’est demandé sur le site.</p><h2 id="retours">Retours sous 14 jours</h2><p>Vous pouvez demander le retour d’un produit dans les 14 jours suivant sa réception. Pour un retour par choix personnel, le produit doit être non utilisé, non ouvert, dans son emballage d’origine fermé et en état d’être remis en vente. Les frais et l’organisation du transport retour sont à votre charge.</p><p>Contactez BLUE DELTA avant tout retour en indiquant la référence de commande, le produit et le motif. Notre équipe vous communique les consignes de retour à l’adresse suivante : Rue Amirat Abdelkader, Ouled Moussa, Boumerdès, Algérie. Vous pouvez rapporter le produit ou organiser son transport après cet échange. N’expédiez pas un emballage qui fuit ou est endommagé sans avoir reçu les consignes adaptées au produit.</p><h2>Produit endommagé, erreur ou non-conformité</h2><p>Si le produit livré est endommagé, défectueux ou ne correspond pas à votre commande, contactez-nous dès que possible avec des photos et les éléments de la commande. BLUE DELTA organise avec vous la solution adaptée : remplacement ou remboursement, et prise en charge des frais nécessaires lorsque le problème lui est imputable.</p><p>Les conditions des retours par choix personnel ne limitent pas les droits légaux applicables en cas de défaut ou de non-conformité, y compris lorsque le problème est constaté après l’ouverture du produit.</p><h2>Remboursement</h2><p>Pour un retour accepté, le prix du produit retourné est remboursé intégralement sous 14 jours après sa réception et son contrôle. Le moyen de remboursement est convenu avec vous, notamment pour une commande payée à réception. Les frais de retour par choix personnel ne sont pas remboursés.</p><h2>Nous contacter</h2><p>Téléphone : <a href="tel:+21324937609">024 93 76 09</a> ou <a href="tel:+213770866417">0770 86 64 17</a>. E-mail : <a class="textlink" href="mailto:contact@bluedelta.dz">contact@bluedelta.dz</a>.</p><a class="btn" href="/contact/">Une question sur votre commande ?</a></div></section>`);
}
