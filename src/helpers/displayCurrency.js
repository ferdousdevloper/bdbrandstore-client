const displayBDTCurrency = (num) =>{
  const formatter = new Intl.NumberFormat('en-IN',{
    style: "currency",
    currency: "BDT",
    maximumFractionDigits : 2
  })

  return formatter.format(num)
}

export default displayBDTCurrency