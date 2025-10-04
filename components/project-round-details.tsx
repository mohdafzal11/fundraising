import { formLabelClasses } from "@/lib/constant";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import RichTextEditor from "./rich-text-editor";
import { DateTimePicker } from "./date-time-picker";
import { Button } from "./ui/button";
import { useState, useMemo } from "react";
import { Project, Round, Investment, Investor } from "@/lib/types/projects";
import { useToast } from "@/components/ui/use-toast";
import { projectRoundsSchema } from "@/lib/schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ROUND_TYPES } from "@/lib/constant";
import { Loader2 } from "lucide-react";

interface ProjectRoundDetailsProps {
  formData: Project;
  setFormData: (formData: Project) => void;
  formErrors: any;
  investors: Investor[];
  investorLoading: boolean;
  searchedInvestor: string;
  setSearchedInvestor: (query: string) => void;
}

function ProjectRoundDetails({
  formData,
  setFormData,
  formErrors,
  investors,
  investorLoading,
  searchedInvestor,
  setSearchedInvestor,
}: ProjectRoundDetailsProps) {
  const { toast } = useToast();
  const [newRound, setNewRound] = useState<Round>({
    title: "",
    description: "",
    date: "",
    amount: "",
    type: "",
    investments: [],
  });
  const [editingRoundIndex, setEditingRoundIndex] = useState<number | null>(null);
  const [newInvestment, setNewInvestment] = useState<Investment>({
    roundId: "",
    investorId: "",
    amount: "",
    currency: "USD",
    tokens: "",
    investedAt: "",
  });
  const [editingInvestmentIndex, setEditingInvestmentIndex] = useState<number | null>(null);

  // Memoized filtered investors based on search query
  const filteredInvestors = useMemo(() => {
    if (!searchedInvestor.trim()) return investors;
    return investors.filter((investor) =>
      investor.name.toLowerCase().includes(searchedInvestor.toLowerCase())
    );
  }, [investors, searchedInvestor]);

  const handleSubmitRound = () => {
    const validation = projectRoundsSchema.safeParse(newRound);
    if (!validation.success) {
      const errors = validation.error.errors;
      toast({
        title: "Validation Error",
        description:
          errors[0]?.message || "Please fill in all required round fields",
        variant: "destructive",
      });
      return;
    }

    const updatedRounds = [...(formData.rounds || [])];
    if (editingRoundIndex !== null) {
      updatedRounds[editingRoundIndex] = newRound;
      setFormData({ ...formData, rounds: updatedRounds });
      toast({
        title: "Success",
        description: "Round updated successfully",
      });
    } else {
      setFormData({
        ...formData,
        rounds: [...(formData.rounds || []), newRound],
      });
      toast({
        title: "Success",
        description: "Round added successfully",
      });
    }

    setNewRound({
      title: "",
      description: "",
      date: "",
      amount: "",
      type: "",
      investments: [],
    });
    setEditingRoundIndex(null);
    setNewInvestment({
      roundId: "",
      investorId: "",
      amount: "",
      currency: "USD",
      tokens: "",
      investedAt: "",
    });
    setEditingInvestmentIndex(null);
    setSearchedInvestor("");
  };

  const handleSubmitInvestment = () => {
    if (!newInvestment.investorId) {
      toast({
        title: "Validation Error",
        description: "Please select an investor",
        variant: "destructive",
      });
      return;
    }

    const updatedInvestments = [...(newRound.investments || [])];
    if (editingInvestmentIndex !== null) {
      updatedInvestments[editingInvestmentIndex] = newInvestment;
    } else {
      updatedInvestments.push(newInvestment);
    }

    setNewRound({ ...newRound, investments: updatedInvestments });
    setNewInvestment({
      roundId: "",
      investorId: "",
      amount: "",
      currency: "USD",
      tokens: "",
      investedAt: "",
    });
    setEditingInvestmentIndex(null);
    setSearchedInvestor("");
    toast({
      title: "Success",
      description:
        editingInvestmentIndex !== null
          ? "Investment updated"
          : "Investment added",
    });
  };

  const startNewRound = () => {
    setNewRound({
      title: "",
      description: "",
      date: "",
      amount: "",
      type: "",
      investments: [],
    });
    setEditingRoundIndex(null);
    setNewInvestment({
      roundId: "",
      investorId: "",
      amount: "",
      currency: "USD",
      tokens: "",
      investedAt: "",
    });
    setEditingInvestmentIndex(null);
    setSearchedInvestor("");
  };

  const editRound = (index: number) => {
    setNewRound(formData.rounds[index]);
    setEditingRoundIndex(index);
    setNewInvestment({
      roundId: "",
      investorId: "",
      amount: "",
      currency: "USD",
      tokens: "",
      investedAt: "",
    });
    setEditingInvestmentIndex(null);
    setSearchedInvestor("");
  };

  const removeRound = (index: number) => {
    const rounds = [...(formData.rounds || [])];
    rounds.splice(index, 1);
    setFormData({ ...formData, rounds });
    if (editingRoundIndex === index) {
      startNewRound();
    }
  };

  const editInvestment = (index: number) => {
    setNewInvestment(newRound.investments[index]);
    setEditingInvestmentIndex(index);
    const investor = investors.find(
      (inv) => inv.id === newRound.investments[index].investorId
    );
    setSearchedInvestor(investor?.name || "");
  };

  const removeInvestment = (index: number) => {
    const updatedInvestments = [...(newRound.investments || [])];
    updatedInvestments.splice(index, 1);
    setNewRound({ ...newRound, investments: updatedInvestments });
    if (editingInvestmentIndex === index) {
      setNewInvestment({
        roundId: "",
        investorId: "",
        amount: "",
        currency: "USD",
        tokens: "",
        investedAt: "",
      });
      setEditingInvestmentIndex(null);
      setSearchedInvestor("");
    }
  };

  const cancelEdit = () => {
    setNewRound({
      title: "",
      description: "",
      date: "",
      amount: "",
      type: "",
      investments: [],
    });
    setEditingRoundIndex(null);
    setNewInvestment({
      roundId: "",
      investorId: "",
      amount: "",
      currency: "USD",
      tokens: "",
      investedAt: "",
    });
    setEditingInvestmentIndex(null);
    setSearchedInvestor("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-md dark:bg-slate-800/40">
          <h3 className="font-medium mb-2 dark:text-white">
            {editingRoundIndex !== null ? "Edit Round" : "New Round"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 dark:text-slate-300">
            Add or edit funding round details and associated investments.
          </p>
          <div className="space-y-4">
            {/* Round Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="roundTitle"
                  className={`${formLabelClasses} dark:text-white`}
                >
                  Round Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="roundTitle"
                  placeholder="Enter round title"
                  value={newRound.title || ""}
                  onChange={(e) =>
                    setNewRound({ ...newRound, title: e.target.value })
                  }
                  className={cn(
                    "h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                    { "border-red-500": formErrors?.rounds?.[0]?.title }
                  )}
                />
                {formErrors?.rounds?.[0]?.title && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.rounds[0].title}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="roundType"
                  className={`${formLabelClasses} dark:text-white`}
                >
                  Round Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={newRound.type}
                  onValueChange={(value) =>
                    setNewRound({ ...newRound, type: value })
                  }
                >
                  <SelectTrigger
                    id="roundType"
                    className={cn(
                      "h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                      { "border-red-500": formErrors?.rounds?.[0]?.type }
                    )}
                  >
                    <SelectValue placeholder="Select round type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {ROUND_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors?.rounds?.[0]?.type && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.rounds[0].type}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="roundDescription"
                className={`${formLabelClasses} dark:text-white`}
              >
                Description
              </label>
              <RichTextEditor
                value={newRound.description || ""}
                onChange={(value) =>
                  setNewRound({ ...newRound, description: value })
                }
                placeholder="Enter round description"
                className="min-h-[100px] dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="roundDate"
                  className={`${formLabelClasses} dark:text-white`}
                >
                  Round Date <span className="text-red-500">*</span>
                </label>
                <DateTimePicker
                  date={newRound.date ? new Date(newRound.date) : undefined}
                  setDate={(date) => {
                    setNewRound({
                      ...newRound,
                      date: date ? date.toISOString() : "",
                    });
                  }}
                  className={cn(
                    "h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                    { "border-red-500": formErrors?.rounds?.[0]?.date }
                  )}
                />
                {formErrors?.rounds?.[0]?.date && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.rounds[0].date}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="roundAmount"
                  className={`${formLabelClasses} dark:text-white`}
                >
                  Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  id="roundAmount"
                  type="number"
                  placeholder="Enter amount"
                  min="0"
                  step="1"
                  value={newRound.amount || ""}
                  onChange={(e) =>
                    setNewRound({
                      ...newRound,
                      amount: e.target.value,
                    })
                  }
                  className={cn(
                    "h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                    { "border-red-500": formErrors?.rounds?.[0]?.amount }
                  )}
                />
                {formErrors?.rounds?.[0]?.amount && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.rounds[0].amount}
                  </p>
                )}
              </div>
            </div>

            {/* Investment Fields */}
            <div className="border-t pt-4 dark:border-slate-700">
              <h4 className="font-medium mb-2 dark:text-white">
                {editingInvestmentIndex !== null
                  ? "Edit Investment"
                  : "New Investment"}
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="investorId"
                    className={`${formLabelClasses} dark:text-white`}
                  >
                    Investor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Select
                      value={newInvestment.investorId}
                      onValueChange={(value) => {
                        setNewInvestment({ ...newInvestment, investorId: value });
                        const selectedInvestor = investors.find(
                          (inv) => inv.id === value
                        );
                        setSearchedInvestor(selectedInvestor?.name || "");
                      }}
                    >
                      <SelectTrigger
                        id="investorId"
                        className={cn(
                          "h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                          {
                            "border-red-500":
                              formErrors?.rounds?.[0]?.investments?.[0]
                                ?.investorId,
                          }
                        )}
                      >
                        <SelectValue placeholder="Select investor" />
                      </SelectTrigger>
                      <SelectContent className="max-h-56">
                        <div className="sticky top-0 bg-background dark:bg-slate-900 p-2 z-10">
                          <Input
                            placeholder="Search investors..."
                            value={searchedInvestor}
                            onChange={(e) => setSearchedInvestor(e.target.value)}
                            className={cn(
                              "h-10 dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                              {
                                "border-red-500":
                                  formErrors?.rounds?.[0]?.investments?.[0]
                                    ?.investorId,
                              }
                            )}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {investorLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : filteredInvestors.length > 0 ? (
                          filteredInvestors.map((investor) => (
                            <SelectItem key={investor.id} value={investor.id || ""}>
                              {investor.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground dark:text-slate-300">
                            No investors found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {formErrors?.rounds?.[0]?.investments?.[0]?.investorId && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.rounds[0].investments[0].investorId}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="investmentAmount"
                    className={`${formLabelClasses} dark:text-white`}
                  >
                    Investment Amount
                  </label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    min="0"
                    placeholder="Enter amount"
                    step="1"
                    value={newInvestment.amount ?? ""}
                    onChange={(e) =>
                      setNewInvestment({
                        ...newInvestment,
                        amount: e.target.value,
                      })
                    }
                    className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div>
                  <label
                    htmlFor="investmentCurrency"
                    className={`${formLabelClasses} dark:text-white`}
                  >
                    Currency
                  </label>
                  <Select
                    value={newInvestment.currency}
                    onValueChange={(value) =>
                      setNewInvestment({ ...newInvestment, currency: value })
                    }
                  >
                    <SelectTrigger
                      id="investmentCurrency"
                      className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                    >
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {["USD", "EUR", "BTC", "ETH"].map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="investmentTokens"
                    className={`${formLabelClasses} dark:text-white`}
                  >
                    Tokens
                  </label>
                  <Input
                    id="investmentTokens"
                    placeholder="Enter tokens"
                    value={newInvestment.tokens ?? ""}
                    onChange={(e) =>
                      setNewInvestment({
                        ...newInvestment,
                        tokens: e.target.value,
                      })
                    }
                    className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="investmentDate"
                  className={`${formLabelClasses} dark:text-white`}
                >
                  Investment Date
                </label>
                <DateTimePicker
                  date={
                    newInvestment.investedAt
                      ? new Date(newInvestment.investedAt)
                      : undefined
                  }
                  setDate={(date) => {
                    setNewInvestment({
                      ...newInvestment,
                      investedAt: date ? date.toISOString() : "",
                    });
                  }}
                  className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  type="button"
                  onClick={handleSubmitInvestment}
                  className={cn(
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "min-w-[100px] h-10 rounded-md dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                  )}
                >
                  {editingInvestmentIndex !== null
                    ? "Update Investment"
                    : "Add Investment"}
                </Button>
                {editingInvestmentIndex !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setNewInvestment({
                        roundId: "",
                        investorId: "",
                        amount: "",
                        currency: "USD",
                        tokens: "",
                        investedAt: "",
                      })
                    }
                    className={cn(
                      "border-gray-200 dark:border-slate-700 text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50",
                      "min-w-[100px] h-10 rounded-md"
                    )}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Display Investments for the Current Round */}
            {newRound.investments && newRound.investments.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2 dark:text-white">
                  Round Investments
                </h4>
                <div className="space-y-2">
                  {newRound.investments.map((investment, index) => (
                    <div
                      key={index}
                      className="bg-muted/20 p-3 rounded-md dark:bg-slate-700/40 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-sm dark:text-white">
                          Investor:{" "}
                          {investors.find(
                            (inv) => inv.id === investment.investorId
                          )?.name || "Unknown"}
                        </div>
                        <div className="text-sm text-muted-foreground dark:text-slate-300">
                          Amount: {investment.amount || "N/A"}{" "}
                          {investment.currency || "USD"}
                          {investment.tokens &&
                            ` • Tokens: ${investment.tokens}`}
                          {investment.investedAt &&
                            ` • ${new Date(
                              investment.investedAt
                            ).toLocaleDateString()}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editInvestment(index)}
                          className="text-primary hover:text-primary/90 hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/20"
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvestment(index)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 dark:text-destructive dark:hover:bg-destructive/20"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                onClick={handleSubmitRound}
                className={cn(
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "min-w-[100px] h-10 rounded-md dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                )}
              >
                {editingRoundIndex !== null ? "Update Round" : "Save Round"}
              </Button>
              {editingRoundIndex !== null && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className={cn(
                    "border-gray-200 dark:border-slate-700 text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50",
                    "min-w-[100px] h-10 rounded-md"
                  )}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Display Added Rounds */}
        {formData.rounds && formData.rounds.length > 0 ? (
          <div className="mt-6">
            <h3 className="font-medium mb-2 dark:text-white">Added Rounds</h3>
            <div className="space-y-3">
              {formData.rounds.map((round, index) => (
                <div
                  key={index}
                  className="bg-muted/50 p-4 rounded-md dark:bg-slate-800/40"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium dark:text-white">
                        {round.title}
                      </div>
                      <div className="text-sm text-muted-foreground dark:text-slate-300">
                        {round.type} • {round.amount} •{" "}
                        {round.date
                          ? new Date(round.date).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editRound(index)}
                        className="text-primary hover:text-primary/90 hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/20"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRound(index)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 dark:text-destructive dark:hover:bg-destructive/20"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  {round.description && (
                    <div
                      className="prose dark:prose-invert max-w-none text-sm text-muted-foreground dark:text-slate-300 mt-2"
                      dangerouslySetInnerHTML={{ __html: round.description }}
                    />
                  )}
                  {round.investments && round.investments.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-medium text-sm dark:text-white">
                        Investments
                      </h4>
                      <div className="space-y-2 mt-2">
                        {round.investments.map((investment, invIndex) => (
                          <div
                            key={invIndex}
                            className="bg-muted/20 p-2 rounded-md dark:bg-slate-700/40 text-sm"
                          >
                            <div className="dark:text-white">
                              Investor:{" "}
                              {investors.find(
                                (inv) => inv.id === investment.investorId
                              )?.name || "Unknown"}
                            </div>
                            <div className="text-muted-foreground dark:text-slate-300">
                              Amount: {investment.amount || "N/A"}{" "}
                              {investment.currency || "USD"}
                              {investment.tokens &&
                                ` • Tokens: ${investment.tokens}`}
                              {investment.investedAt &&
                                ` • ${new Date(
                                  investment.investedAt
                                ).toLocaleDateString()}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 p-4 rounded-md dark:bg-slate-800/40 text-center text-sm text-muted-foreground dark:text-slate-300">
            No rounds added yet
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectRoundDetails;