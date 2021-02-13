"use strict";

/**
 * Order.js controller
 *
 * @description: A set of functions called "actions" for managing `Order`.
 */

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const stripe = require("stripe")("sk_test_Rocg7zBDUcIZA7xpBWAjN8Nk00VlqgzbaF");

module.exports = {
  /**
   * Create a/an order record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    const { address, amount, dishes, token, city, state } = JSON.parse(
      ctx.request.body
    );
    // remove description field from dishes
    const dishesReFmt = dishes.map((dish) => {
      return { id: dish.id, name: dish.name, 
              price: dish.price, quantity: dish.quantity, restaurant: dish.restaurant };
    });
    // console.log('dishesReFmt: \n', dishesReFmt);

    const stripeAmount = Math.floor(amount * 100);
    // charge on stripe
    const charge = await stripe.charges.create({
      // Transform cents to dollars.
      amount: stripeAmount,
      currency: "usd",
      description: `Order ${new Date()} by ${ctx.state.user._id}`,
      source: token,
    });

    // Register the order in the database
    const order = await strapi.services.order.create({
      user_id: ctx.state.user.id,
      charge_id: charge.id,
      amount: stripeAmount,
      address,
      dishes: [...dishesReFmt],
      city,
      state,
    });

    // console.log('order: \n', order);

    // email our customer
    if (ctx.state.user.email) {
      const dishesTmpl = order.dishes.map((dish) => {
        return `\n\tName: ${dish.name} \tPrice: $ ${dish.price.toFixed(2)}  \tQty: ${dish.quantity} \tRestaurant: ${dish.restaurant}`;
      });

      await strapi.plugins['email'].services.email.send({
        to: `${ctx.state.user.email}`,
        from: 'thangricktran@att.net',
        replyTo: "thangricktran2@gmail.com",
        subject: 'Your Order at Restaurant.com',
        text: `
        Date: ${new Date()} 
        Order Id: ${order.id}        
            ${dishesTmpl}

        Total amount: $ ${(order.amount/100).toFixed(2)}
          
        Thank You For Your Orders,        
        `,
      });
    }
    return order;
  },
};
