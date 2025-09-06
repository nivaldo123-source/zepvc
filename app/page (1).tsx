"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Heart, MessageCircle, Users, ChevronDown, Lock, X } from "lucide-react"
import { useState } from "react"

export default function ProfilePage() {
  const [showCookieConsent, setShowCookieConsent] = useState(true)
  const [showPopup, setShowPopup] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: number } | null>(null)
  const [selectedOrderBumps, setSelectedOrderBumps] = useState<{ [key: string]: boolean }>({})
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState("")
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [pixCodeCopied, setPixCodeCopied] = useState(false)

  const orderBumps = [
    {
      id: "thomaz-costa",
      name: "Privacy Thomaz Costa",
      description: "Privacy Thomaz Costa 30 dias",
      price: 9.9,
      image: "/thomaz-costa-new.png",
    },
    {
      id: "yuri-bonotto",
      name: "Privacy Yuri Bonotto",
      description: "Privacy Yuri Bonotto 30 dias",
      price: 9.9,
      image: "/yuri-bonotto.png",
    },
    {
      id: "leo-santana",
      name: "Privacy Leo Santana",
      description: "Privacy Leo Santana 30 dias",
      price: 9.9,
      image: "/leo-santana.png",
    },
    {
      id: "caio-castro",
      name: "Privacy Caio Castro",
      description: "Privacy Caio Castro 30 dias",
      price: 9.9,
      image: "/caio-castro-new.jpeg",
    },
  ]

  const handleSubscriptionClick = (planName: string, price: number) => {
    setSelectedPlan({ name: planName, price })
    setShowPopup(true)
    setQrCodeData(null)
    setTransactionId(null)
    setCustomerEmail("")
  }

  const toggleOrderBump = (id: string) => {
    setSelectedOrderBumps((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const calculateTotal = () => {
    let total = selectedPlan?.price || 0
    orderBumps.forEach((bump) => {
      if (selectedOrderBumps[bump.id]) {
        total += bump.price
      }
    })
    return total
  }

  const createPixTransaction = async () => {
    if (!customerEmail) {
      alert("Por favor, insira seu email para continuar")
      return
    }

    setIsProcessingPayment(true)

    try {
      const totalAmount = calculateTotal()
      const selectedBumps = orderBumps.filter((bump) => selectedOrderBumps[bump.id])

      const transactionData = {
        external_id: `privacy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        total_amount: totalAmount,
        payment_method: "PIX",
        webhook_url: "https://webhook.site/your-webhook-url",
        ip: "127.0.0.1",
        customer: {
          name: "Cliente Privacy",
          email: customerEmail,
          phone: "11999999999",
          document_type: "CPF",
          document: "11144477735",
        },
        items: [
          {
            id: "privacy_subscription",
            title: `Privacy - ${selectedPlan?.name}`,
            description: `Assinatura Privacy ${selectedPlan?.name}`,
            price: selectedPlan?.price || 0,
            quantity: 1,
            is_physical: false,
          },
          ...selectedBumps.map((bump, index) => ({
            id: bump.id,
            title: bump.name,
            description: bump.description,
            price: bump.price,
            quantity: 1,
            is_physical: false,
          })),
        ],
      }

      console.log("[v0] Sending transaction data:", transactionData)

      const response = await fetch("https://api.viperpay.org/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-secret":
            "sk_5d064414c4eda7eba6dded2c21f47f156e0a70e9e0b2f7a83be60f69957a0e260ddef8eff7593891f6ff8f8d186f1d791d3dfd1e9ebb95ec02546f2c142643e3",
        },
        body: JSON.stringify(transactionData),
      })

      console.log("[v0] Response status:", response.status)

      const result = await response.json()
      console.log("[v0] Response data:", result)

      if (!response.ok || result.hasError) {
        const errorMessage = result.message || result.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      if (result.pix && result.pix.payload) {
        setTransactionId(result.id || result.external_id)
        setQrCodeData(result.pix.payload)
      } else {
        throw new Error("Resposta da API inválida - dados PIX não encontrados")
      }
    } catch (error) {
      console.error("[v0] Erro ao processar pagamento:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      alert(`Erro ao processar pagamento: ${errorMessage}`)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const generateQRCodeImage = (pixPayload: string) => {
    // Using QR Server API to generate QR code image
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`
  }

  const copyPixCode = async () => {
    if (qrCodeData) {
      try {
        await navigator.clipboard.writeText(qrCodeData)
        setPixCodeCopied(true)
        setTimeout(() => setPixCodeCopied(false), 2000)
      } catch (err) {
        console.error("Erro ao copiar código PIX:", err)
        alert("Erro ao copiar código PIX")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-center py-2 px-4 bg-white">
        <img src="/logoprivaci.webp" alt="Privacy" className="h-6 w-auto" />
      </header>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-2 sm:px-4">
        <div className="relative overflow-hidden mb-4 sm:mb-6">
          <div className="relative h-72 sm:h-80 md:h-96">
            <img src="/zee-cover.webp" alt="Zé Felipe Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

            <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
              <div className="rounded-lg px-3 py-2 mb-2">
                <h2
                  className="text-white text-lg sm:text-xl font-bold"
                  style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)" }}
                >
                  Zé Felipe
                </h2>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-white text-xs sm:text-sm font-medium rounded-lg px-3 py-2">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)" }}>258</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)" }}>154</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)" }}>282</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 sm:px-4">
          <div className="flex justify-start mb-3 sm:mb-4 -mt-10 sm:-mt-12 ml-2 relative z-10">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-3 sm:border-4 border-white shadow-xl">
              <AvatarImage src="/zee-profile.jpeg" alt="Zé Felipe Profile" className="object-cover" />
              <AvatarFallback>ZF</AvatarFallback>
            </Avatar>
          </div>

          <div className="mb-4 sm:mb-6">
            <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">@zefelipe</p>

            <Card className="p-3 sm:p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
              <p className="text-gray-700 leading-relaxed text-xs sm:text-sm text-pretty break-words">
                Bem-vindo ao meu lado mais íntimo. Aqui no meu Privacy, você faz parte de um grupo seleto que tem acesso
                ao que ninguém mais vê. Aqui você vai ver tudo, é real, é cru, é sem cortes. Esse conteúdo não tá em
                lugar nenhum, só aqui — feito especialmente pra você. Aproveita o valor promocional. Bora viver essa
                experiência comigo? 🔥
              </p>
            </Card>
          </div>
        </div>

        {/* Subscriptions Section */}
        <div className="px-2 sm:px-4 mb-4 sm:mb-6">
          <Card className="p-4 sm:p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Assinaturas</h3>

            <button
              onClick={() => handleSubscriptionClick("1 mês", 9.9)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 sm:py-6 rounded-xl mb-4 sm:mb-6 shadow-lg transition-all duration-300 hover:shadow-xl active:scale-[1.02]"
              style={{ backgroundColor: "#f97316", color: "#ffffff" }}
            >
              <div className="flex justify-between items-center w-full px-2 sm:px-4 text-white">
                <span className="text-base sm:text-lg font-bold text-white">1 mês</span>
                <span className="text-base sm:text-lg font-bold text-white">R$ 9,90</span>
              </div>
            </button>

            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="text-base sm:text-lg font-semibold text-gray-700">Promoções</h4>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => handleSubscriptionClick("3 meses", 19.9)}
                  className="w-full flex justify-between items-center p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-gray-800 font-semibold text-sm sm:text-base">3 meses</span>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 sm:px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                      Economia
                    </span>
                  </div>
                  <span className="text-orange-500 font-bold text-base sm:text-lg whitespace-nowrap">R$ 19,90</span>
                </button>

                <button
                  onClick={() => handleSubscriptionClick("Vitalício", 49.9)}
                  className="w-full flex justify-between items-center p-3 sm:p-4 border border-orange-200 rounded-xl bg-orange-50/30 hover:bg-orange-50/60 hover:border-orange-300 transition-all duration-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-gray-800 font-semibold text-sm sm:text-base">Vitalício</span>
                    <span className="text-xs bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full font-semibold whitespace-nowrap">
                      Melhor oferta
                    </span>
                  </div>
                  <span className="text-orange-500 font-bold text-base sm:text-lg whitespace-nowrap">R$ 49,90</span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="px-2 sm:px-4 mb-4 sm:mb-6">
          <div className="bg-gray-100 rounded-xl p-1 flex">
            <div className="flex-1 text-center py-2 sm:py-3 bg-white rounded-lg shadow-sm">
              <span className="text-orange-500 font-bold text-base sm:text-lg">93</span>
              <p className="text-orange-500 font-semibold text-xs sm:text-sm">postagens</p>
            </div>
            <div className="flex-1 text-center py-2 sm:py-3">
              <span className="text-gray-500 font-bold text-base sm:text-lg">412</span>
              <p className="text-gray-500 font-semibold text-xs sm:text-sm">mídias</p>
            </div>
          </div>
        </div>

        <div className="px-2 sm:px-4 mb-4 sm:mb-6">
          <Card className="p-3 sm:p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
                <AvatarImage src="/zee-profile.jpeg" alt="Zé Felipe Profile" className="object-cover" />
                <AvatarFallback>ZF</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-base sm:text-lg truncate">Zé Felipe</h4>
                <p className="text-gray-500 text-sm sm:text-base truncate">@zefelipe</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 relative h-[450px] sm:h-[550px] bg-gray-400 rounded-lg overflow-hidden">
              <video
                className="w-full h-full object-cover filter blur-sm"
                src="/caiocastro-video.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 sm:p-4 mb-4 sm:mb-6">
                  <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex items-center gap-3 sm:gap-6 text-white text-xs sm:text-sm font-medium bg-black/30 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>258</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>154</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>282</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex items-center justify-between px-1 sm:px-2">
              <div className="flex items-center gap-4 sm:gap-6">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-red-500 transition-colors cursor-pointer" />
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-blue-500 transition-colors cursor-pointer" />
                <button className="flex items-center gap-1 sm:gap-2 bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors">
                  <span>+</span>
                  <span className="hidden xs:inline">Enviar mimo</span>
                  <span className="xs:hidden">Mimo</span>
                </button>
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-600 hover:border-gray-800 transition-colors cursor-pointer"></div>
            </div>
          </Card>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-t-2xl relative">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-gray-600 hover:bg-gray-100 rounded-full p-1 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Privacy logo section with white background */}
              <div className="text-center py-6 px-6">
                <img src="/logoprivaci.webp" alt="Privacy" className="h-8 w-auto mx-auto" />
              </div>

              {/* Orange security banner */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3">
                <div className="flex items-center justify-center gap-3 text-white">
                  <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="font-bold text-sm">COMPRA 100% SEGURA</span>
                  <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded border border-white/30">
                    <span className="text-xs font-bold">18+</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!qrCodeData ? (
                <>
                  <div className="space-y-4 mb-6">
                    {orderBumps.map((bump) => (
                      <div
                        key={bump.id}
                        className="border-2 border-orange-200 bg-orange-50/30 rounded-xl p-4 hover:border-orange-400 hover:bg-orange-50/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={bump.image || "/placeholder.svg"}
                            alt={bump.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">{bump.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{bump.description}</p>
                            <p className="text-orange-600 font-bold">+ R$ {bump.price.toFixed(2).replace(".", ",")}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={bump.id}
                            checked={selectedOrderBumps[bump.id] || false}
                            onChange={() => toggleOrderBump(bump.id)}
                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <label htmlFor={bump.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                            Quero comprar também!
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-gray-900 mb-3">Resumo do Pedido</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Privacy - {selectedPlan?.name}</span>
                        <span className="font-medium">R$ {selectedPlan?.price.toFixed(2).replace(".", ",")}</span>
                      </div>
                      {orderBumps.map(
                        (bump) =>
                          selectedOrderBumps[bump.id] && (
                            <div key={bump.id} className="flex justify-between">
                              <span className="text-gray-700">{bump.name}</span>
                              <span className="font-medium">R$ {bump.price.toFixed(2).replace(".", ",")}</span>
                            </div>
                          ),
                      )}
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-orange-600">R$ {calculateTotal().toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email para cadastro:
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      required
                    />
                  </div>

                  <button
                    onClick={createPixTransaction}
                    disabled={isProcessingPayment || !customerEmail}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? "Processando..." : "PAGAR AGORA"}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Pagamento via PIX</h3>
                  <p className="text-gray-600 mb-6">Escaneie o QR Code abaixo para realizar o pagamento:</p>

                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6 inline-block">
                    <img
                      src={generateQRCodeImage(qrCodeData) || "/placeholder.svg"}
                      alt="QR Code PIX"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Código PIX (Copia e Cola):</p>
                    <div className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-600 font-mono break-all leading-relaxed">{qrCodeData}</p>
                    </div>
                    <button
                      onClick={copyPixCode}
                      className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                        pixCodeCopied ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {pixCodeCopied ? "Código Copiado!" : "Copiar Código PIX"}
                    </button>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-orange-800 font-medium">
                      Valor total: <span className="font-bold">R$ {calculateTotal().toFixed(2).replace(".", ",")}</span>
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Após o pagamento, você receberá acesso imediato ao conteúdo no email: {customerEmail}
                    </p>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    <p>Código da transação: {transactionId}</p>
                  </div>

                  <button
                    onClick={() => {
                      setQrCodeData(null)
                      setTransactionId(null)
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 sm:p-3 shadow-lg z-50">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <p className="text-xs text-gray-700 flex-1">
              O Privacy usa cookies e tecnologias semelhantes para fornecer, manter e melhorar nossos serviços. Se você
              aceitar, usaremos esses dados para personalização e análises associadas.
            </p>
            <button
              onClick={() => setShowCookieConsent(false)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors whitespace-nowrap"
            >
              Aceitar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
