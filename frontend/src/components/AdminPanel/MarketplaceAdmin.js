// src/components/AdminPanel/MarketplaceAdmin.jsx
import React,{useState} from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow 
} from '@mui/material';
import { VerifiedUser as NFTIcon } from '@mui/icons-material';

const BlockchainTransactionTable = ({ transactions }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>NFT</TableCell>
          <TableCell>From</TableCell>
          <TableCell>To</TableCell>
          <TableCell>Value</TableCell>
          <TableCell>Block</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.hash}>
            <TableCell>
              <NFTIcon /> {tx.nftId}
            </TableCell>
            <TableCell>{tx.from.slice(0, 6)}...{tx.from.slice(-4)}</TableCell>
            <TableCell>{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</TableCell>
            <TableCell>{tx.value} ETH</TableCell>
            <TableCell>{tx.block}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const MarketplaceAdmin = () => {
  const [transactions] = useState([
    // Sample blockchain transactions
    {
      hash: '0x123...',
      nftId: '#456',
      from: '0xabc...',
      to: '0xdef...',
      value: 0.5,
      block: 123456
    }
  ]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Blockchain Marketplace Management
        </Typography>
        <BlockchainTransactionTable transactions={transactions} />
      </Grid>
    </Grid>
  );
};

export default MarketplaceAdmin;